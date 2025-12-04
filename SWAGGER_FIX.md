# Swagger Configuration Fix for Serverless Deployments (Vercel, AWS Lambda, etc.)

## Problem Statement

**Issue**: Swagger UI loads correctly but shows **NO endpoints** when deployed to serverless platforms (Vercel, Netlify, AWS Lambda), while working fine locally.

**Symptoms**:
- ✅ Swagger UI page loads at your configured route (e.g., `/api-docs`, `/swagger`)
- ✅ Swagger interface is visible with branding/title
- ❌ No API endpoints are displayed in the documentation
- ✅ Works perfectly on localhost
- ❌ Fails on serverless deployment

**Root Cause**: File path resolution issues in serverless environments due to:
1. Incorrect relative paths in swagger configuration
2. Using glob patterns that don't work in serverless
3. Missing JSDoc annotations in route files
4. Configuration split between multiple files

---

## Understanding the Core Problem

### How Swagger JSDoc Works

Swagger JSDoc scans your JavaScript files for JSDoc comments and generates OpenAPI documentation:

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Description here
 */
```

**Critical**: If Swagger JSDoc can't find your files, it can't extract the documentation.

### Why It Breaks on Serverless

| Local Development | Serverless (Vercel/Lambda) |
|-------------------|---------------------------|
| Files on disk in predictable locations | Files bundled into function packages |
| Relative paths work from project root | Only relative to current file work |
| Glob patterns (`**/*.js`) work | Glob patterns often fail |
| `./src/routes/*.js` resolves correctly | Path resolution is different |

**Solution**: Use absolute paths relative to the current file, not the project root.

---

## Solution: Step-by-Step Fix

### Step 1: Understand Your File Structure

Map out where your swagger config file is relative to your route files:

```
Example Structure A (Common):
project-root/
├── src/
│   ├── routes/
│   │   └── user.routes.js
│   └── config/
│       └── swagger.config.js
└── app.js

Example Structure B (Alternative):
project-root/
├── routes/
│   └── user.routes.js
├── swagger/
│   └── swagger.config.js
└── server.js

Example Structure C (Nested):
project-root/
├── api/
│   ├── v1/
│   │   └── routes/
│   │       └── user.routes.js
│   └── docs/
│       └── swagger.config.js
└── index.js
```

**Identify**: Where is your `swagger.config.js` located? Where are your route files?

---

### Step 2: Fix Path Resolution in swagger.config.js

**KEY PRINCIPLE**: Always use `__dirname` to get absolute paths.

#### Get __dirname in ES Modules

If using ES6 modules (`import/export`):

```javascript
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

If using CommonJS (`require`):

```javascript
const path = require('path');
// __dirname is already available
```

#### Calculate Relative Paths

From your swagger config file location, navigate to your routes:

```javascript
// If swagger config is in: src/config/swagger.config.js
// And routes are in: src/routes/

// Go UP one level (to src/), then INTO routes/
join(__dirname, '../routes/user.routes.js')

// If swagger config is in: config/swagger.config.js
// And routes are in: routes/

// Go UP one level (to root), then INTO routes/
join(__dirname, '../routes/user.routes.js')

// If swagger config is in: src/swagger/swagger.config.js
// And routes are in: src/routes/

// Go UP one level (to src/), then INTO routes/
join(__dirname, '../routes/user.routes.js')
```

**Rule of Thumb**:
- Use `../` to go UP one directory level
- Use `./` for files in the SAME directory
- Use `../../` to go UP two levels
- Chain as needed: `../../../routes/file.js`

---

### Step 3: Fixed swagger.config.js Template

```javascript
import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Your API Name',
        version: '1.0.0',
        description: 'Your API description',
    },
    servers: [
        {
            // Use environment variable for flexibility
            url: process.env.NODE_ENV === 'production' 
                ? process.env.API_BASE_URL || 'https://your-production-domain.com/api'
                : `http://localhost:${process.env.PORT || 3000}/api`,
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
    },
    security: [{ bearerAuth: [] }],
};

const swaggerOptions = {
    swaggerDefinition,
    apis: [
        // ✅ CORRECT: Use join with __dirname
        // Adjust paths based on YOUR folder structure
        
        // Example: If routes are in ../routes/ from this file
        join(__dirname, '../routes/user.routes.js'),
        join(__dirname, '../routes/auth.routes.js'),
        join(__dirname, '../routes/product.routes.js'),
        
        // Example: If you have separate swagger doc files
        join(__dirname, './user.swagger.js'),
        join(__dirname, './auth.swagger.js'),
        
        // ❌ WRONG: These will fail on serverless
        // './src/routes/*.js',
        // '../routes/**/*.js',
        // 'routes/user.routes.js',
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Debug logging (optional, remove in production)
if (process.env.NODE_ENV !== 'production') {
    console.log('📂 Swagger config directory:', __dirname);
    console.log('📝 Endpoints found:', Object.keys(swaggerSpec.paths || {}).length);
    console.log('🛣️  Available paths:', Object.keys(swaggerSpec.paths || {}));
}

export default swaggerSpec;
```

**Key Points**:
- ✅ List each file explicitly
- ✅ Use `join(__dirname, 'relative-path')`
- ❌ Don't use glob patterns (`*.js`, `**/*.js`)
- ❌ Don't use paths from project root

---

### Step 4: Update Your Main Application File

Your main server file (e.g., `app.js`, `server.js`, `index.js`):

```javascript
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './path/to/swagger.config.js'; // Adjust path

const app = express();

// Optional: UI customization options
const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Your API Documentation",
};

// Setup Swagger UI
app.use(
    '/api-docs',  // Change this to your preferred path
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Your other routes...
app.listen(process.env.PORT || 3000);
```

**Important**: 
- Don't create multiple swagger configurations
- Keep swagger spec import from ONE place
- UI options are separate from API documentation

---

## Required: JSDoc Annotations in Route Files

### Route files MUST have JSDoc comments

Swagger JSDoc looks for `@swagger` or `@openapi` tags in your files:

```javascript
// user.routes.js
import express from 'express';
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/users/:id', getUserById);

export default router;
```

**Without these comments, Swagger cannot find your endpoints!**

---

## Debugging: How to Find Path Issues

### Add Debug Logging

Add this to your `swagger.config.js`:

```javascript
import fs from 'fs';

// After defining your apis array
const apis = [
    join(__dirname, '../routes/user.routes.js'),
    join(__dirname, '../routes/auth.routes.js'),
];

// Debug each path
console.log('\n🔍 Checking file paths:');
apis.forEach(apiPath => {
    const exists = fs.existsSync(apiPath);
    console.log(`${exists ? '✅' : '❌'} ${apiPath}`);
});

console.log(`\n📝 Total endpoints found: ${Object.keys(swaggerSpec.paths || {}).length}`);
console.log('🛣️  Endpoint paths:', Object.keys(swaggerSpec.paths || {}));
```

### Check Logs

**Locally**:
```bash
npm start
# Look for console output showing paths
```

**On Vercel**:
1. Go to Vercel Dashboard
2. Select your project → Deployments
3. Click latest deployment → Function Logs
4. Look for your debug output

**Expected Output**:
```
🔍 Checking file paths:
✅ /var/task/src/routes/user.routes.js
✅ /var/task/src/routes/auth.routes.js

📝 Total endpoints found: 5
🛣️  Endpoint paths: [ '/users', '/users/{id}', '/auth/login', '/auth/register', '/health' ]
```

**If you see**:
```
📝 Total endpoints found: 0
```

Then your files either:
1. Don't exist at those paths (file path wrong)
2. Don't have JSDoc annotations
3. Have syntax errors in JSDoc

---

## Common Scenarios & Solutions

### Scenario 1: Monorepo with Multiple Services

```
monorepo/
├── packages/
│   ├── service-a/
│   │   ├── routes/
│   │   └── swagger.config.js
│   └── service-b/
│       ├── routes/
│       └── swagger.config.js
```

Each service needs its own swagger config with paths relative to that config file.

### Scenario 2: TypeScript Project

```javascript
// swagger.config.ts
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {
    swaggerDefinition: { /* ... */ },
    apis: [
        // Point to compiled JS files, not TS files
        path.join(__dirname, '../dist/routes/*.js'),
        // OR keep pointing to TS files if swagger-jsdoc supports it
        path.join(__dirname, '../src/routes/*.ts'),
    ],
};
```

### Scenario 3: Separate Swagger Documentation Files

If you keep swagger docs separate from routes:

```
project/
├── routes/
│   └── user.routes.js        (No JSDoc here)
├── docs/
│   ├── swagger.config.js
│   └── user.swagger.js       (JSDoc here)
```

```javascript
// swagger.config.js
apis: [
    join(__dirname, './user.swagger.js'),
    join(__dirname, './auth.swagger.js'),
    // Don't include route files if they have no JSDoc
],
```

### Scenario 4: Microservices with Gateway

Each service has its own swagger config, gateway aggregates them.

---

## Environment Variables Setup

### Required Environment Variables

```env
# .env file
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# For production (set in your hosting platform)
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com
```

### How to Set on Different Platforms

**Vercel**:
1. Project Settings → Environment Variables
2. Add `API_BASE_URL`, `NODE_ENV`, etc.
3. Redeploy

**Netlify**:
1. Site Settings → Build & Deploy → Environment
2. Add variables
3. Redeploy

**AWS Lambda**:
1. Function Configuration → Environment Variables
2. Add key-value pairs

**Railway/Render**:
1. Environment section in dashboard
2. Add variables

---

## Verification Checklist

Before deploying, verify:

- [ ] `__dirname` is properly configured for ES6 or CommonJS
- [ ] All route files are listed explicitly in `apis` array
- [ ] Paths use `join(__dirname, 'relative-path')` format
- [ ] No glob patterns (`*.js`, `**/*.js`) used
- [ ] All route files have JSDoc `@swagger` comments
- [ ] Debug logging added (temporarily)
- [ ] Tested locally - endpoints appear
- [ ] Environment variables configured
- [ ] No hardcoded URLs (use env vars)

After deploying:

- [ ] Check deployment logs for debug output
- [ ] Verify "endpoints found" count > 0
- [ ] Visit `/api-docs` and see endpoints
- [ ] Test "Try it out" functionality

---

## Troubleshooting Guide

### Problem: Zero endpoints found

**Cause**: Files not being read or have no JSDoc.

**Fix**:
1. Add debug logging to verify file paths exist
2. Check that files have `@swagger` or `@openapi` comments
3. Verify no syntax errors in JSDoc

### Problem: Some endpoints missing

**Cause**: Not all route files listed in config.

**Fix**: Add all route files explicitly to `apis` array.

### Problem: Works locally but not in production

**Cause**: Path resolution differences.

**Fix**: 
1. Use `join(__dirname, ...)` not relative strings
2. List files explicitly, don't use glob patterns
3. Check deployment logs for actual paths being used

### Problem: Swagger UI loads but shows errors

**Cause**: Invalid OpenAPI spec or missing definitions.

**Fix**:
1. Validate your JSDoc syntax
2. Ensure all `$ref` references exist
3. Check browser console for specific errors

### Problem: 404 on /api-docs

**Cause**: Route not registered or base path mismatch.

**Fix**:
1. Verify `app.use('/api-docs', ...)` is called
2. Check if you have a base path that affects routes
3. Ensure swagger middleware loads before other routes

---

## Package Requirements

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "swagger-jsdoc": "^6.2.0",
    "swagger-ui-express": "^5.0.0"
  },
  "type": "module"
}
```

**Note**: If using ES6 modules, `"type": "module"` is required in `package.json`.

For CommonJS, omit this and use `require` instead of `import`.

---

## Alternative Approach: Manual Swagger Spec

If file scanning continues to fail, define your spec manually:

```javascript
const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Your API',
        version: '1.0.0',
    },
    paths: {
        '/users': {
            get: {
                summary: 'Get all users',
                responses: {
                    '200': { description: 'Success' }
                }
            }
        },
        // Define all endpoints manually
    }
};

export default swaggerSpec;
```

This bypasses file scanning entirely but requires manual maintenance.

---

## Quick Reference

### Path Resolution From Swagger Config

| Config Location | Routes Location | Correct Path |
|----------------|-----------------|--------------|
| `config/swagger.js` | `routes/` | `join(__dirname, '../routes/file.js')` |
| `src/config/swagger.js` | `src/routes/` | `join(__dirname, '../routes/file.js')` |
| `docs/swagger.js` | `api/routes/` | `join(__dirname, '../api/routes/file.js')` |
| `swagger/config.js` | `swagger/` (same) | `join(__dirname, './file.js')` |

### Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `'./routes/*.js'` | `join(__dirname, '../routes/file.js')` |
| `'src/routes/user.js'` | `join(__dirname, '../routes/user.js')` |
| `'**/*.routes.js'` | List each file explicitly |
| No JSDoc comments | Add `@swagger` comments |

---

## Additional Resources

- **Swagger JSDoc**: https://github.com/Surnet/swagger-jsdoc
- **Swagger UI Express**: https://github.com/scottie1984/swagger-ui-express
- **OpenAPI 3.0 Specification**: https://swagger.io/specification/
- **Vercel Serverless Functions**: https://vercel.com/docs/functions
- **AWS Lambda Best Practices**: https://docs.aws.amazon.com/lambda/
- **JSDoc Reference**: https://jsdoc.app/

---

## Summary

**The Core Fix**: Replace all relative path strings with `join(__dirname, 'relative-path')` and list files explicitly instead of using glob patterns.

**Why It Works**: Serverless environments bundle files differently. Absolute paths from `__dirname` work consistently across local and production.

**Key Takeaway**: One properly configured swagger config file + correct file paths + JSDoc annotations = working Swagger documentation everywhere.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Compatible With**: Node.js 14+, Express 4+, Swagger JSDoc 6+, All serverless platforms