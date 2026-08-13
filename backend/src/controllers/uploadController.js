const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

// The file is attached to req.file by multer middleware
const uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    // In a real app, you might upload to S3 here.
    // For local, we just return the local URL path.
    const fileUrl = `/uploads/${req.file.filename}`;
    
    return success(res, { url: fileUrl, filename: req.file.filename }, 'File uploaded successfully');
});

const uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
         throw new AppError('No files uploaded', 400);
    }

    const filesInfo = req.files.map(f => ({
         url: `/uploads/${f.filename}`,
         filename: f.filename
    }));

    return success(res, Object.assign({}, ...filesInfo), 'Files uploaded successfully');
});

const uploadFirebaseImage = asyncHandler(async (req, res) => {
    console.log('[IMAGE_UPLOAD] request received');
    if (!req.file) {
        console.error('[IMAGE_UPLOAD] No file uploaded');
        return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    console.log('[IMAGE_UPLOAD] file received', req.file.originalname, req.file.size);

    if (req.file.size > 5 * 1024 * 1024) {
         console.error('[IMAGE_UPLOAD] File too large');
         return res.status(413).json({ success: false, message: 'Image too large. Maximum size is 5MB.' });
    }

    try {
        console.log('[IMAGE_UPLOAD] firebase initialized');
        const { storage } = require('../config/firebase');
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'thenam-tss.firebasestorage.app';
        const bucket = storage.bucket(bucketName);
        
        const ext = req.file.originalname.split('.').pop();
        const filename = `avatars/${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
        const fileUpload = bucket.file(filename);

        console.log('[IMAGE_UPLOAD] upload started');
        await fileUpload.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
            public: true
        });
        console.log('[IMAGE_UPLOAD] upload completed');

        // The secure public URL provided by Firebase Storage
        const fileUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        console.log('[IMAGE_UPLOAD] download URL generated', fileUrl);

        return res.status(200).json({
            success: true,
            message: 'Image uploaded to Firebase successfully',
            data: { url: fileUrl, filename }
        });
    } catch (error) {
        console.error('[IMAGE_UPLOAD] upload failed', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image to Firebase Storage: ' + error.message });
    }
});

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadFirebaseImage
};
