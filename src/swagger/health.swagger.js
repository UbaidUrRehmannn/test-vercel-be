// src/swagger/health.swagger.js

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check endpoints
 */

/**
 * @swagger
 * /health-check:
 *   get:
 *     summary: Health check for backend, PostgreSQL, and R2
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Health check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     backend:
 *                       type: boolean
 *                       example: true
 *                     postgres:
 *                       type: boolean
 *                       example: true
 *                     r2:
 *                       type: boolean
 *                       example: false
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-09-03T10:15:30.000Z
 *                     environment:
 *                       type: string
 *                       example: development
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Health check completed
 *             examples:
 *               all_services_healthy:
 *                 summary: All services healthy
 *                 value:
 *                   data:
 *                     backend: true
 *                     postgres: true
 *                     r2: true
 *                     timestamp: "2024-01-15T10:30:00Z"
 *                     environment: "development"
 *                   status: 200
 *                   message: "Health check completed"
 *               r2_service_down:
 *                 summary: R2 service down
 *                 value:
 *                   data:
 *                     backend: true
 *                     postgres: true
 *                     r2: false
 *                     timestamp: "2024-01-15T10:30:00Z"
 *                     environment: "development"
 *                   status: 200
 *                   message: "Health check completed"
 *               database_down:
 *                 summary: Database service down
 *                 value:
 *                   data:
 *                     backend: true
 *                     postgres: false
 *                     r2: true
 *                     timestamp: "2024-01-15T10:30:00Z"
 *                     environment: "development"
 *                   status: 200
 *                   message: "Health check completed"
 */
