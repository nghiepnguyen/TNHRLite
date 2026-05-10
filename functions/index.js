const { onRequest } = require("firebase-functions/v2/https");
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin globally
admin.initializeApp();

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
