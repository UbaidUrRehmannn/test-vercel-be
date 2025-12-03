// Import required modules
import fs from 'fs'; // For working with file system (reading and removing local files)
import {
    S3Client, // R2 client to interact with Cloudflare R2
    PutObjectCommand, // Command to upload a file to R2
    DeleteObjectCommand, // Command to delete a file from R2
    HeadBucketCommand, // Command to check if the bucket exists and is reachable
} from '@aws-sdk/client-s3'; // AWS SDK v3 for interacting with S3-compatible services
import { envVariables } from '../constant.js';

// Function to validate R2 configuration from environment variables
const validateR2Config = () => {
    // Define the required environment variables for R2 setup
    const requiredVars = [
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME',
        'R2_ENDPOINT',
    ];

    // Filter out the missing environment variables
    const missingVars = requiredVars.filter(
        (varName) => !envVariables[varName],
    );

    // If any variables are missing, throw an error
    if (missingVars.length > 0) {
        throw new Error(`Missing R2 configuration: ${missingVars.join(', ')}`);
    }
};

// Initialize the R2 client (using AWS SDK v3)
const r2Client = new S3Client({
    region: 'auto', // Cloudflare R2 uses 'auto' region
    endpoint: envVariables.R2_ENDPOINT, // R2 endpoint from environment variables
    credentials: {
        accessKeyId: envVariables.R2_ACCESS_KEY_ID, // Access key for Cloudflare R2
        secretAccessKey: envVariables.R2_SECRET_ACCESS_KEY, // Secret key for Cloudflare R2
    },
});

// Function to test R2 connection
const testR2Connection = async () => {
    try {
        // Validate that the R2 configuration exists
        validateR2Config();

        // Create a command to check if the bucket exists (HeadBucketCommand)
        const command = new HeadBucketCommand({
            Bucket: envVariables.R2_BUCKET_NAME, // Bucket name to check
        });

        // Send the command to R2 to check the bucket
        await r2Client.send(command);
        return { success: true, message: 'R2 connection successful' }; // Return success message if bucket exists
    } catch (error) {
        // If the connection or bucket check fails, return failure message
        console.error('R2 connection test failed:', error.message);
        return {
            success: false,
            message: `R2 connection failed: ${error.message}`,
            error: error.message, // Return the error message
        };
    }
};

// Function to get the content type (MIME type) based on the file extension
const getContentType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase(); // Get the file extension and convert it to lowercase
    const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
    };
    // Return the MIME type based on the file extension or default to 'application/octet-stream'
    return mimeTypes[ext] || 'application/octet-stream';
};

// Function to upload a file to R2
const uploadFile = async (localFilePath, key) => {
    try {
        // Check if the local file path and the key (filename) are provided
        if (!localFilePath) {
            throw new Error('Local file path is required');
        }

        if (!key) {
            throw new Error('Key (filename) is required');
        }

        // Validate R2 configuration to ensure necessary keys are set
        validateR2Config();

        // Check if the local file exists on the disk
        if (!fs.existsSync(localFilePath)) {
            throw new Error(`Local file not found: ${localFilePath}`);
        }

        // Create a read stream for the local file
        const fileStream = fs.createReadStream(localFilePath);
        // Get the content type based on the file extension
        const contentType = getContentType(key);

        // Create a command to upload the file to R2
        const command = new PutObjectCommand({
            Bucket: envVariables.R2_BUCKET_NAME, // R2 bucket where the file will be uploaded
            Key: key, // The key (filename) for the uploaded file
            Body: fileStream, // The content of the file
            ContentType: contentType, // MIME type of the file
            ACL: 'public-read', // Make the file publicly accessible
        });

        // Send the command to R2 to upload the file
        await r2Client.send(command);

        // After uploading, remove the local file to clean up
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // Return the public URL of the uploaded file
        const publicUrl = `${envVariables.R2_PUBLIC_URL}/${key}`;
        console.log(`File uploaded successfully to R2: ${publicUrl}`);

        return publicUrl; // Return the public URL of the uploaded file
    } catch (error) {
        console.error('Error uploading to R2:', error.message);

        // Clean up local file if upload fails
        if (localFilePath && fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (cleanupError) {
                console.error(
                    'Failed to cleanup local file:',
                    cleanupError.message,
                );
            }
        }

        // Throw an error if upload fails
        throw new Error(`R2 upload failed: ${error.message}`);
    }
};

// Function to delete a file from R2
const deleteFile = async (key) => {
    try {
        // Ensure the key (filename) is provided
        if (!key) {
            throw new Error('Key (filename) is required');
        }

        // Validate R2 configuration before deletion
        validateR2Config();

        // Create a command to delete the file from R2
        const command = new DeleteObjectCommand({
            Bucket: envVariables.R2_BUCKET_NAME,
            Key: key,
        });

        // Send the command to R2 to delete the file
        await r2Client.send(command);
        console.log(`File deleted successfully from R2: ${key}`);
        return true; // Return true if the deletion was successful
    } catch (error) {
        console.error('Error deleting file from R2:', error.message);
        throw new Error(`R2 delete failed: ${error.message}`);
    }
};

// Utility function to remove a local temp file (if needed)
const removeLocalFile = (localFilePath) => {
    // Check if the local file exists
    if (localFilePath && fs.existsSync(localFilePath)) {
        try {
            // Remove the local file
            fs.unlinkSync(localFilePath);
            console.log(`Local file removed: ${localFilePath}`);
        } catch (error) {
            console.error(`Failed to remove local file: ${error.message}`);
        }
    }
};

// Export all the functions so they can be used in other parts of the application
export { uploadFile, deleteFile, removeLocalFile, testR2Connection };
