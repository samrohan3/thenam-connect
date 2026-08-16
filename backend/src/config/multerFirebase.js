const multer = require('multer');

// All chat file uploads go to memory so we can pipe them
// to Firebase Storage client-side or serve them directly.
const storage = multer.memoryStorage();

// Allowed MIME types for chat uploads
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Videos
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv',
  // Archives
  'application/zip', 'application/x-zip-compressed',
  'application/x-rar-compressed', 'application/x-7z-compressed',
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const uploadChatFile = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB for videos
  },
  fileFilter,
});

module.exports = uploadChatFile;
