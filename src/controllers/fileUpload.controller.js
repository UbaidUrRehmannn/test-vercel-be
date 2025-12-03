import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import ApiResponse from '../utils/responsehandler.js';
import { uploadFile, removeLocalFile } from '../config/cloudflareR2.js';
// import { logAuditEvent, AUDIT_ACTIONS, AUDIT_ENTITIES, getClientInfoFromRequest } from '../utils/auditLogger.js';

//! @desc Upload file to Cloudflare R2
//! @route POST /api/v1/file/upload-file
//! @access Private
const uploadFileController = asyncHandler(async (req, res) => {
    const { folder } = req.body; // Optional folder parameter
    const { id: userId, name: userName } = req.user;

    if (!req.file) {
        throw new ApiError(400, 'No file provided');
    }

    try {
        // Generate unique filename with folder structure
        const timestamp = Date.now();
        const randomString = Math.round(Math.random() * 1e9);
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;
        const key = `${folder || 'uploads'}/${fileName}`;

        // Upload file to R2 using the existing cloudflareR2 function
        const publicUrl = await uploadFile(req.file.path, key);

        // Generate numeric entityId from filename hash for audit logging
        const entityId = fileName.split('').reduce((hash, char) => {
            const charCode = char.charCodeAt(0);
            return ((hash << 5) - hash) + charCode;
        }, 0) >>> 0; // Convert to unsigned 32-bit integer
        const finalEntityId = entityId || 1; // Ensure minimum value of 1

        // Log audit event
        // const clientInfo = getClientInfoFromRequest(req);
        // await logAuditEvent({
        //     action: AUDIT_ACTIONS.CREATE,
        //     entity: AUDIT_ENTITIES.FILE,
        //     entityId: finalEntityId,
        //     userId: userId,
        //     userName: userName || req.user.email || 'Unknown',
        //     changes: {
        //         before: null,
        //         after: {
        //             fileName: req.file.originalname,
        //             fileSize: req.file.size,
        //             mimeType: req.file.mimetype,
        //             folder: folder || 'uploads',
        //             publicUrl: publicUrl
        //         }
        //     },
        //     ipAddress: clientInfo.ipAddress,
        //     userAgent: clientInfo.userAgent,
        //     description: `File uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`
        // });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        publicUrl,
                        fileName: req.file.originalname,
                        fileSize: req.file.size,
                        mimeType: req.file.mimetype,
                        uploadedBy: {
                            id: userId,
                            name: userName,
                        },
                    },
                    'File uploaded successfully'
                )
            );
    } catch (error) {
        // Clean up local file if upload fails
        if (req.file && req.file.path) {
            removeLocalFile(req.file.path);
        }
        throw error;
    }
});

export { uploadFileController };
