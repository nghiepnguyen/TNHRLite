const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  console.log('--- Inspecting workspaceMembers ---');
  const snapshot = await db.collection('workspaceMembers').get();
  
  let total = 0;
  let invalidCount = 0;

  for (const doc of snapshot.docs) {
    total++;
    const data = doc.data();
    const expectedId = `${data.userId}_${data.workspaceId}`;
    console.log(`Document ID: "${doc.id}"`);
    console.log(`- userId    : "${data.userId}"`);
    console.log(`- workspaceId: "${data.workspaceId}"`);
    console.log(`- role       : "${data.role}"`);
    console.log(`- expectedId : "${expectedId}"`);
    
    if (doc.id !== expectedId) {
      invalidCount++;
      console.log(`🚨 ID MISMATCH!`);
    }

    // Check if workspace exists
    if (data.workspaceId) {
      const wsSnap = await db.collection('workspaces').doc(data.workspaceId).get();
      console.log(`- Workspace exists?: ${wsSnap.exists}`);
      if (wsSnap.exists) {
        console.log(`- Workspace Name   : "${wsSnap.data().name}"`);
        console.log(`- Workspace Owner  : "${wsSnap.data().ownerId}"`);
      }
    }
    console.log('-----------------------------');
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total membership documents: ${total}`);
  console.log(`Invalid membership documents: ${invalidCount}`);
}

run().catch(console.error);
