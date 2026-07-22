const admin = require('firebase-admin');

// We use a try-catch so the backend doesn't crash entirely if the user hasn't provided a valid service account JSON yet.
try {
  // If the user provides the service account in an env variable as a JSON string, we can parse it.
  // Otherwise, they should provide a file path to 'firebase-service-account.json'.
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Attempt to load from local file if env variable isn't present
    try {
      serviceAccount = require('../../firebase-service-account.json');
    } catch (e) {
      console.warn("⚠️ Firebase Admin: No firebase-service-account.json found in backend root.");
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized Successfully");
  } else {
    console.warn("⚠️ Firebase Admin initialization skipped. Please provide FIREBASE_SERVICE_ACCOUNT env var or firebase-service-account.json.");
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error:", error);
}

module.exports = admin;
