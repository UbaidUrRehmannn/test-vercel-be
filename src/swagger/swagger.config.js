// src/swagger/swagger.config.js
import swaggerJSDoc from 'swagger-jsdoc';
import { envVariables } from '../constant.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'AG Printers API',
        version: '1.0.0',
        description: 'API documentation for AG Printers project',
    },
    servers: [
        {
            url: envVariables.ENVIRONMENT === 'production' 
                ? 'https://cloudlearner.duckdns.org:1126/api/v1'
                : 'http://localhost:' + (envVariables.PORT || 8080) + '/api/v1',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    statusCode: {
                        type: 'integer',
                        description: 'HTTP status code',
                        example: 200
                    },
                    data: {
                        type: 'object',
                        description: 'Response data payload',
                        nullable: true
                    },
                    message: {
                        type: 'string',
                        description: 'Response message',
                        example: 'Operation completed successfully'
                    },
                    success: {
                        type: 'boolean',
                        description: 'Success status indicator',
                        example: true
                    }
                },
                required: ['statusCode', 'message', 'success']
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    status: {
                        type: 'integer',
                        description: 'HTTP status code',
                        example: 400
                    },
                    message: {
                        type: 'string',
                        description: 'Error message',
                        example: 'Validation failed'
                    },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'Array of specific error messages',
                        example: ['Field is required', 'Invalid format']
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Error timestamp',
                        example: '2024-01-15T10:30:00Z'
                    }
                },
                required: ['status', 'message']
            },
            ValidationError: {
                type: 'object',
                properties: {
                    field: {
                        type: 'string',
                        description: 'Field name that failed validation',
                        example: 'email'
                    },
                    message: {
                        type: 'string',
                        description: 'Validation error message',
                        example: 'Email format is invalid'
                    },
                    value: {
                        type: 'string',
                        description: 'The invalid value provided',
                        example: 'invalid-email'
                    },
                    constraint: {
                        type: 'string',
                        description: 'Validation constraint that failed',
                        example: 'email'
                    }
                },
                required: ['field', 'message']
            },
            PaginationInfo: {
                type: 'object',
                properties: {
                    currentPage: {
                        type: 'integer',
                        description: 'Current page number',
                        example: 1,
                        minimum: 1
                    },
                    totalPages: {
                        type: 'integer',
                        description: 'Total number of pages',
                        example: 5,
                        minimum: 0
                    },
                    totalItems: {
                        type: 'integer',
                        description: 'Total number of items',
                        example: 50,
                        minimum: 0
                    },
                    itemsPerPage: {
                        type: 'integer',
                        description: 'Number of items per page',
                        example: 10,
                        minimum: 1,
                        maximum: 100
                    },
                    hasNextPage: {
                        type: 'boolean',
                        description: 'Whether there is a next page',
                        example: true
                    },
                    hasPrevPage: {
                        type: 'boolean',
                        description: 'Whether there is a previous page',
                        example: false
                    }
                },
                required: ['currentPage', 'totalPages', 'totalItems', 'itemsPerPage', 'hasNextPage', 'hasPrevPage']
            }
        }
    },
    security: [{ bearerAuth: [] }],
    tags: [
        {
            name: 'Health',
            description: 'API health check endpoints',
        },
        {
            name: 'File-Upload',
            description: 'File upload and management endpoints',
        },
        {
            name: 'Authentication',
            description: 'Authentication and authorization endpoints',
        },
        {
            name: 'User Management',
            description: 'User management endpoints (Super Admin only)',
        },
        {
            name: 'Clients',
            description: 'Client management endpoints',
        },
        {
            name: 'Invoices',
            description: 'Invoice management and billing operations',
        },
        {
            name: 'Quotations',
            description: 'Quotation management and pricing operations',
        },
        {
            name: 'Audit Logs',
            description: 'Audit log management and activity tracking',
        },
    ],
};

// __dirname is: /src/swagger/
// We need to go up to /src/ then into routes and swagger folders

const swaggerOptions = {
    swaggerDefinition,
    apis: [
        // Routes folder (one level up, then into routes)
        join(__dirname, '../routes/fileUpload.routes.js'),
        // You can add more route files here:
        // join(__dirname, '../routes/auth.routes.js'),
        // join(__dirname, '../routes/client.routes.js'),
        // etc.
        
        // Swagger documentation files (same folder)
        join(__dirname, './file-upload.swagger.js'),
        join(__dirname, './health.swagger.js'),
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Debug logging
// console.log('🔍 Swagger config loaded');
// console.log('📂 Current directory:', __dirname);
// console.log('📝 Number of paths found:', Object.keys(swaggerSpec.paths || {}).length);
// console.log('🛣️  Paths:', Object.keys(swaggerSpec.paths || {}));

export default swaggerSpec;