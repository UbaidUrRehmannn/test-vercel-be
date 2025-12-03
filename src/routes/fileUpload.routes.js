import express from 'express';
import { uploadFileController } from '../controllers/fileUpload.controller.js';
import { upload, handleUploadError } from '../middleware/multer.middleware.js';

const router = express.Router();

// File upload route with multer middleware
router.post('/upload-file', 
    upload.single('file'),
    handleUploadError,
    uploadFileController
);

export default router;
