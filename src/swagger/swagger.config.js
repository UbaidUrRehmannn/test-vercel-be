// swagger.config.js
import swaggerJSDoc from 'swagger-jsdoc';
import { envVariables } from '../constant.js';

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

    // 👇 Add this to control order of tags in Swagger UI
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
        // you can add more here in the order you want
    ],
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [
        './src/routes/*.js', 
        './src/controllers/*.js', 
        './src/swagger/*.js',
        './src/swagger/user.swagger.js',
        './src/swagger/userManagement.swagger.js',
        './src/swagger/health.swagger.js',
        './src/swagger/client.swagger.js',
        './src/swagger/invoice.swagger.js',
        './src/swagger/quotation.swagger.js',
        './src/swagger/audit.swagger.js',
        './src/swagger/department.swagger.js',
        './src/swagger/socket.swagger.js',
        './src/swagger/file-upload.swagger.js'
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
