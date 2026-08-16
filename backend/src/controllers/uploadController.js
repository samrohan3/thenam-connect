const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// @desc  Upload single file to local disk (legacy / avatar endpoint)
// @route POST /api/upload/single
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const fileUrl = `/uploads/${req.file.filename}`;
  return success(res, { url: fileUrl, filename: req.file.filename }, 'File uploaded successfully');
});

// @desc  Upload multiple files to local disk
// @route POST /api/upload/multiple
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw new AppError('No files uploaded', 400);
  const filesInfo = req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename }));
  return success(res, filesInfo, 'Files uploaded successfully');
});

// @desc  Upload image/file to Firebase Storage via Admin SDK (avatar upload)
// @route POST /api/upload/firebase-image
// NOTE: Requires a valid Firebase service account configured via environment variables.
//       Chat file uploads use the client-side Firebase SDK directly — they do NOT go through this endpoint.
const uploadFirebaseImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const { storage } = require('../config/firebase');

  // Validate Firebase Admin is properly initialised
  if (!storage) {
    console.error('[uploadFirebaseImage] Firebase Admin storage not initialized. Check FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET env vars.');
    return res.status(503).json({
      success: false,
      message: 'Firebase Storage is not configured on the server. Please contact the administrator.'
    });
  }

  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'File too large. Maximum size is 10 MB.' });
  }

  try {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'thenam-tss.firebasestorage.app';
    const bucket = storage.bucket(bucketName);

    const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase();
    const safeFilename = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const fileRef = bucket.file(safeFilename);

    await fileRef.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      public: true,
    });

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${safeFilename}`;
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: safeFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('[uploadFirebaseImage] Upload failed:', error.message);

    // Provide a meaningful error for common Firebase misconfigurations
    if (error.message?.includes('Could not load the default credentials') ||
        error.message?.includes('UNAUTHENTICATED') ||
        error.message?.includes('service_account')) {
      return res.status(503).json({
        success: false,
        message: 'Firebase Storage credentials are not configured. Chat file uploads use the client-side Firebase SDK — this endpoint is only needed for avatar uploads.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'File upload failed: ' + error.message
    });
  }
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFirebaseImage,
};
