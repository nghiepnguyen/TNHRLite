const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin globally
admin.initializeApp();

// Auto-seed plans collection
const db = admin.firestore();
async function seedPlans() {
  try {
    const plansRef = db.collection('plans');
    const snapshot = await plansRef.get();
    if (snapshot.empty) {
      console.log("🌱 Database is empty of plans. Seeding plans...");
      await plansRef.doc('free').set({
        name: 'Free',
        jobs: 5,
        candidates: 50,
        cvParsesPerMonth: 10
      });
      await plansRef.doc('pro').set({
        name: 'Pro',
        jobs: 50,
        candidates: 500,
        cvParsesPerMonth: 100
      });
      await plansRef.doc('team').set({
        name: 'Team',
        jobs: -1,
        candidates: -1,
        cvParsesPerMonth: -1
      });
      console.log("✨ Plans seeded successfully!");
    } else {
      console.log("✓ Plans already exist in Firestore.");
    }
  } catch (error) {
    console.error("❌ Error seeding plans:", error.message);
  }
}
// Skip during `firebase deploy` local code analysis (no ADC on developer machine).
if (process.env.K_SERVICE || process.env.FUNCTIONS_EMULATOR === 'true') {
  seedPlans();
}

const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

const app = express();

// Permissive CORS for the function
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Export the Express app as a Cloud Function
exports.api = onRequest({
  timeoutSeconds: 120, // Give Gemini time to process
  cors: true,
  maxInstances: 10,
  secrets: ["GEMINI_API_KEY", "RESEND_API_KEY", "RESEND_FROM_EMAIL"]
}, app);

// Scheduled function to reset monthly AI resume parses count on 1st of every month
exports.resetMonthlyUsage = onSchedule("0 0 1 * *", async (event) => {
  const workspacesRef = db.collection('workspaces');
  
  try {
    const snapshot = await workspacesRef.get();
    const batch = db.batch();
    let count = 0;
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const currentUsage = data.usage || {};
      
      // Only reset if usage is actually greater than 0
      if (currentUsage.cvParsesThisMonth && currentUsage.cvParsesThisMonth > 0) {
        const newUsage = {
          ...currentUsage,
          cvParsesThisMonth: 0
        };
        
        batch.update(doc.ref, {
          usage: newUsage,
          usageResetAt: admin.firestore.FieldValue.serverTimestamp()
        });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
    console.log(`Successfully reset cvParsesThisMonth for ${count} workspaces.`);
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
});
