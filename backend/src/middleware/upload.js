const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const UPLOAD_BASE = path.join(__dirname, '../../uploads');

ensureDir(UPLOAD_BASE);
ensureDir(path.join(UPLOAD_BASE, 'avatars'));
ensureDir(path.join(UPLOAD_BASE, 'documents'));
ensureDir(path.join(UPLOAD_BASE, 'attachments'));
ensureDir(path.join(UPLOAD_BASE, 'logos'));
ensureDir(path.join(UPLOAD_BASE, 'invoices'));

// Generic storage factory
const makeStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD_BASE, subfolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });

// File filter: images only
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// File filter: documents
const documentFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document type'), false);
  }
};

// File filter: any
const anyFilter = (req, file, cb) => {
  cb(null, true);
};

// Avatar upload (images, max 5MB)
const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Logo upload (images, max 5MB)
const uploadLogo = multer({
  storage: makeStorage('logos'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Document upload (docs, max 10MB)
const uploadDocument = multer({
  storage: makeStorage('documents'),
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Attachment upload (any, max 10MB)
const uploadAttachment = multer({
  storage: makeStorage('attachments'),
  fileFilter: anyFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Invoice upload (any, max 10MB)
const uploadInvoice = multer({
  storage: makeStorage('invoices'),
  fileFilter: anyFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper: build public URL from file path
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const relative = path.relative(UPLOAD_BASE, filePath).replace(/\\/g, '/');
  return `${req.protocol}://${req.get('host')}/uploads/${relative}`;
};

module.exports = {
  uploadAvatar,
  uploadLogo,
  uploadDocument,
  uploadAttachment,
  uploadInvoice,
  getFileUrl,
  UPLOAD_BASE
};
