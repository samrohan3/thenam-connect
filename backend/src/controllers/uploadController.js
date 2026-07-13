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

    return success(res, filesInfo, 'Files uploaded successfully');
});

module.exports = {
    uploadSingle,
    uploadMultiple
};
