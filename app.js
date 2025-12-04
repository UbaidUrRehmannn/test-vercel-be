import express from 'express'
import { envVariables } from './src/constant.js'
import cors from 'cors';
import { testR2Connection } from './src/config/cloudflareR2.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger/swagger.config.js';

const app = express()
const PORT = envVariables.PORT || 8000

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);

// Swagger UI options (only UI customization here)
const swaggerUiOptions = {
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js"
    ],
};

// Single Swagger setup - spec comes from swagger.config.js
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

app.get('/api/v1/health-check', async (req, res) => {
    const healthReport = {
        backend: true,
        postgres: false,
        r2: false,
        timestamp: new Date().toISOString(),
        environment: envVariables.ENVIRONMENT || 'development',
    };

    // Check PostgreSQL connection
    try {
        await sequelize.authenticate();
        healthReport.postgres = true;
    } catch (err) {
        console.error('PostgreSQL health check failed:', err.message);
    }

    // Check R2 connection
    try {
        const r2Result = await testR2Connection();
        healthReport.r2 = r2Result.success;
    } catch (err) {
        console.error('R2 health check error:', err.message);
    }

    res.status(200).json({
        data: healthReport,
        status: 200,
        message: 'Health check completed',
    });
});

app.get('/', (req, res) => {
  res.status(200).json({
    data: null,
    message: 'Server is up and running 🚀 ',
    route: '/',
    description: 'This is the root route of the server',
    envoirnment: envVariables.ENVIRONMENT || "hehe"
  })
})

app.get('/about', (req, res) => {
  res.status(200).json({
    data: null,
    message: 'You have landed on about page route',
    route: '/about',
    description: 'This is the about route of the server'
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})