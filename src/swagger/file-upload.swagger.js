// src/swagger/file-upload.swagger.js

/**
 * @swagger
 * tags:
 *   name: File-Upload
 *   description: File upload and management endpoints
 */

/**
 * @swagger
 * /file/upload-file:
 *   post:
 *     summary: Upload a file to Cloudflare R2
 *     tags: [File-Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *                 maxLength: 10485760
 *               folder:
 *                 type: string
 *                 description: Optional folder name to organize files e.g pdf, excel, images, etc
 *                 example: 'documents'
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z0-9\-_]+$'
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicUrl:
 *                       type: string
 *                       format: uri
 *                       example: 'https://your-r2-domain.com/uploads/1234567890-123456789.jpg'
 *                     fileName:
 *                       type: string
 *                       example: 'document.pdf'
 *                     fileSize:
 *                       type: integer
 *                       example: 1024000
 *                     mimeType:
 *                       type: string
 *                       example: 'application/pdf'
 *                     uploadedBy:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         name:
 *                           type: string
 *                           example: 'John Doe'
 *                 message:
 *                   type: string
 *                   example: 'File uploaded successfully'
 *       400:
 *         description: Bad request - No file provided, invalid file type, or file too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 'No file provided'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['File is required']
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2024-01-15T10:30:00Z'
 *             examples:
 *               no_file:
 *                 summary: No file provided
 *                 value:
 *                   status: 400
 *                   message: 'No file provided'
 *                   errors: ['File is required']
 *                   timestamp: '2024-01-15T10:30:00Z'
 *               file_too_large:
 *                 summary: File too large
 *                 value:
 *                   status: 400
 *                   message: 'File too large'
 *                   errors: ['File size must not exceed 10MB']
 *                   timestamp: '2024-01-15T10:30:00Z'
 *               invalid_file_type:
 *                 summary: Invalid file type
 *                 value:
 *                   status: 400
 *                   message: 'Invalid file type'
 *                   errors: ['File type not allowed']
 *                   timestamp: '2024-01-15T10:30:00Z'
 *               invalid_folder_name:
 *                 summary: Invalid folder name
 *                 value:
 *                   status: 400
 *                   message: 'Validation failed'
 *                   errors: ['Folder name can only contain letters, numbers, hyphens, and underscores']
 *                   timestamp: '2024-01-15T10:30:00Z'
 *               folder_name_too_long:
 *                 summary: Folder name too long
 *                 value:
 *                   status: 400
 *                   message: 'Validation failed'
 *                   errors: ['Folder name must not exceed 50 characters']
 *                   timestamp: '2024-01-15T10:30:00Z'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error - File upload failed
 */
