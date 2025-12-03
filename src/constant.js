import dotenv from 'dotenv';
dotenv.config();

export const constant = {
    dbName: 'mm-emp-portal',
    dataLimit: '20kb',
    avatarImageSize: 5, // size is in MB
    coverImageSize: 8, // size is in MB
    mimeType: {
        image: 'image/',
    },
    messages: {
        error: 'Something went wrong',
        success: 'Success',
    },
};
export const publicRouts = ['/api/v1/health-check', "/api/v1/auth/login", "/api/v1/auth/refresh-token", "/api/v1/auth/forgot-password", "/api/v1/auth/reset-password", "/api/v1/clients/cities"];

export const envVariables = {
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    PORT: process.env.PORT || 8080,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URLS: process.env.FRONTEND_URLS,
    EMAIL_FRONTEND_URL: process.env.EMAIL_FRONTEND_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '4h',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '8h',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_REGION: process.env.R2_REGION || 'auto',
    BREVO_API_KEY: process.env.BREVO_API_KEY,
};

// Tweet statuses for content moderation
export const invoiceStatuses = {
    PENDING: 'pending',
    RECEIVED: 'received'
};

// User roles for easy reference and validation
export const userRoles = {
    SUPER_ADMIN: 'Super Admin',
    SUPPORT_ADMIN: 'Support Admin',
};

export const resourceTypes = ['auth', 'file', 'client', 'invoice', 'quotation', 'audit', 'user'];

// Centralized permissions for each resource type and role
export const resourcePermissions = {
    auth: {
        public: ['login', 'auth/debug-token/:id'],
        authenticated: ['logout', 'refresh-token', 'me', 'profile', 'change-password'],
        super_admin: [],
        support_admin: []
    },
    file: {
        public: ['upload-file'],
        authenticated: [],
        super_admin: [],
        support_admin: []
    },
    client: {
        public: ['cities'],
        authenticated: ['', 'stats', 'get/:id'], // Common routes for both roles
        super_admin: ['create', 'update/:id', 'delete/:id'], // Super admin only routes
        support_admin: ['create', 'update/:id'] // Support admin routes (no delete)
    },
    invoice: {
        public: [],
        authenticated: ['', 'stats', 'next-number', 'get/:id', 'outstanding', 'receivable', 'gst-report', 'overdue'], // Common routes for both roles
        super_admin: ['create', 'update/:id', 'disable/:id', ':id/active'], // Super admin has full access including active toggle
        support_admin: ['create', 'update/:id'] // Support admin can create/edit but cannot change status to 'received'
    },
    quotation: {
        public: [],
        authenticated: ['', 'stats', 'next-number', 'get/:id', 'expired', 'status/:status'], // Common routes for both roles
        super_admin: ['create', 'update/:id', 'update/:id/status', 'delete/:id', ':id/active'], // Super admin has full access
        support_admin: ['create', 'update/:id', 'update/:id/status'] // Support admin can create/edit and change status but cannot delete
    },
    audit: {
        public: [],
        authenticated: ['recent', 'my-activity', 'summary'], // Common routes for both roles
        super_admin: ['activities', 'user/:userId', 'entity/:entity/:entityId'], // Super admin only routes
        support_admin: [] // Support admin has same access as authenticated
    },
    user: {
        public: [],
        authenticated: [], // No user management for regular authenticated users
        super_admin: ['', 'stats', 'create', 'update/:id', 'get/:id', 'delete/:id', 'resend-password'], // Super Admin only
        support_admin: [] // Support Admin cannot manage users
    }
    
};
