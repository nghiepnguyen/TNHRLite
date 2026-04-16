/**
 * HR-Lite: Multi-Workspace Backfill Migration Script (Firestore)
 * 
 * Purpose:
 * 1. Identify all users with existing data.
 * 2. Ensure each user has a default workspace.
 * 3. Assign all legacy records (without workspaceId) to the user's default workspace.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin (Assuming serviceAccount.json is available in environment)
// initializeApp({ credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT) });
const db = getFirestore();

async function backfillMultiWorkspace() {
  console.log('--- Starting Multi-Workspace Backfill ---');
  
  const collectionsToMigrate = ['jobs', 'candidates', 'applications'];
  const userWorkspaceMap = new Map(); // userId -> workspaceId

  try {
    // Phase 1: Create Default Workspaces for owners of legacy data
    for (const collName of collectionsToMigrate) {
      console.log(`Scanning collection: ${collName}...`);
      const snapshot = await db.collection(collName).get();
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const userId = data.createdBy;
        
        if (!data.workspaceId && userId) {
          if (!userWorkspaceMap.has(userId)) {
            // Create a default workspace for this user
            const workspaceRef = await db.collection('workspaces').add({
              name: 'My Workspace (Migrated)',
              ownerId: userId,
              createdAt: FieldValue.serverTimestamp(),
            });
            
            // Register membership
            const memberId = `${userId}_${workspaceRef.id}`;
            await db.collection('workspaceMembers').doc(memberId).set({
              workspaceId: workspaceRef.id,
              userId: userId,
              role: 'owner',
              joinedAt: FieldValue.serverTimestamp(),
            });

            // Update user profile with default workspace
            await db.collection('users').doc(userId).update({
              defaultWorkspaceId: workspaceRef.id,
              onboarded: true
            });

            userWorkspaceMap.set(userId, workspaceRef.id);
            console.log(`Created default workspace ${workspaceRef.id} for user ${userId}`);
          }
        }
      }
    }

    // Phase 2: Assign records to their respective default workspaces
    let totalUpdated = 0;
    for (const collName of collectionsToMigrate) {
      const snapshot = await db.collection(collName).get();
      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.workspaceId && data.createdBy) {
          const workspaceId = userWorkspaceMap.get(data.createdBy);
          if (workspaceId) {
            batch.update(doc.ref, { workspaceId: workspaceId });
            count++;
          }
        }
      });

      if (count > 0) {
        await batch.commit();
        totalUpdated += count;
        console.log(`Updated ${count} records in ${collName}`);
      }
    }

    console.log(`--- Backfill Complete. Total records migrated: ${totalUpdated} ---`);
  } catch (error) {
    console.error('Backfill failed:', error);
  }
}

// backfillMultiWorkspace();
module.exports = { backfillMultiWorkspace };
