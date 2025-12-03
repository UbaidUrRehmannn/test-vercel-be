import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';
// import { envVariables, userRoles } from '../constant.js';
import ApiError from './errorhandler.js';
import { uploadFile, removeLocalFile } from '../config/cloudflareR2.js';

/**
 * Generate a random alphanumeric password
 * @param {number} length - Length of the password (default: 10)
 * @returns {string} Random alphanumeric password
 */
// export const generateRandomPassword = (length = 10) => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
//     for (let i = 0; i < length; i++) {
//         password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return password;
// };

// export const generateAccessAndRefreshToken = async (userId) => {
//     try {
//         // Get user with role from the role column
//         const user = await User.findByPk(userId);

//         if (!user) {
//             throw new ApiError(404, 'User not found');
//         }

//         // Generate access token
//         const accessToken = jwt.sign(
//             {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role || userRoles.SUPPORT_ADMIN, // Use role from user model column
//             },
//             envVariables.ACCESS_TOKEN_SECRET,
//             {
//                 expiresIn: envVariables.ACCESS_TOKEN_EXPIRY,
//             },
//         );

//         // Generate refresh token
//         const refreshToken = jwt.sign(
//             {
//                 id: user.id,
//             },
//             envVariables.REFRESH_TOKEN_SECRET,
//             {
//                 expiresIn: envVariables.REFRESH_TOKEN_EXPIRY,
//             },
//         );

//         // Save refresh token to user
//         user.refreshToken = refreshToken;
//         await user.save({ validateBeforeSave: false });

//         return { accessToken, refreshToken };
//     } catch (error) {
//         throw new ApiError(
//             500,
//             'Something went wrong while generating access or refresh token',
//         );
//     }
// };

/**
 * Upload a file to Cloudflare R2 and return the public URL
 * @param {Object} file - The file object from multer
 * @param {string} folder - Optional folder name to organize files (default: 'uploads')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFileToR2 = async (file, folder = 'uploads') => {
    try {
        if (!file) {
            throw new ApiError(400, 'No file provided');
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            removeLocalFile(file.path);
            throw new ApiError(400, 'File size too large. Maximum size is 10MB');
        }

        // Allowed file types
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed',
            'application/vnd.rar',
            'application/x-rar-compressed',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            removeLocalFile(file.path);
            throw new ApiError(
                400,
                'Invalid file type. Allowed types: images, PDF, documents, text files, and archives'
            );
        }

        // Generate unique filename with folder structure
        const timestamp = Date.now();
        const randomString = Math.round(Math.random() * 1e9);
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;
        const key = `${folder}/${fileName}`;

        // Upload file to R2
        const publicUrl = await uploadFile(file.path, key);
        
        return publicUrl;
    } catch (error) {
        // Clean up local file if it exists
        if (file && file.path) {
            removeLocalFile(file.path);
        }

        // Re-throw ApiError instances
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle unexpected errors
        throw new ApiError(500, `File upload failed: ${error.message}`);
    }
};