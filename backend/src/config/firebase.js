const { initializeApp, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');

// Initialize Firebase Admin SDK safely
let app;
if (!getApps().length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'thenam-tss';
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'thenam-tss.firebasestorage.app';
    app = initializeApp({
      projectId,
      storageBucket
    });
    console.log(`[Firebase Admin] Initialized for project: ${projectId}`);
  } catch (err) {
    console.error('[Firebase Admin] Initialization error:', err.message);
  }
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const storage = getStorage(app);

/**
 * Create a new user in Firebase Auth
 */
const createFirebaseUser = async ({ email, password, displayName }) => {
  try {
    const userRecord = await auth.createUser({
      email,
      password: password || 'Thenam@12345',
      displayName: displayName || email.split('@')[0],
      emailVerified: true
    });
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      const existing = await auth.getUserByEmail(email);
      return existing;
    }
    throw error;
  }
};

/**
 * Update an existing Firebase user (e.g., disable/enable, email, password)
 */
const updateFirebaseUser = async (uid, updates) => {
  if (!uid) return null;
  try {
    const userRecord = await auth.updateUser(uid, updates);
    return userRecord;
  } catch (error) {
    console.error(`[Firebase Admin] Error updating user ${uid}:`, error.message);
    return null;
  }
};

/**
 * Delete a user from Firebase Auth
 */
const deleteFirebaseUser = async (uid) => {
  if (!uid) return null;
  try {
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error(`[Firebase Admin] Error deleting user ${uid}:`, error.message);
    return false;
  }
};

/**
 * Get Firebase user by email
 */
const getFirebaseUserByEmail = async (email) => {
  try {
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') return null;
    throw error;
  }
};

/**
 * Verify Firebase ID Token
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('[Firebase Admin] Token verification failed:', error.message);
    return null;
  }
};

/**
 * Generate Password Reset Link for Email
 */
const generatePasswordResetLink = async (email) => {
  try {
    const link = await auth.generatePasswordResetLink(email);
    return link;
  } catch (error) {
    console.error('[Firebase Admin] Password reset link generation error:', error.message);
    throw error;
  }
};

module.exports = {
  auth,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
  getFirebaseUserByEmail,
  verifyFirebaseToken,
  generatePasswordResetLink,
  storage
};
