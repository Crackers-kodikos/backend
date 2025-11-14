import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tailoring Workshop API',
            version: '1.0.0',
            description: 'API documentation for Tailoring Workshop system',
            contact: {
                name: 'Support',
                email: 'support@workshop.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3232',
                description: 'Local Development Server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    // IMPORTANT: Use correct relative paths from config directory
    apis: [
        './routes/authRoutes.js',
        './routes/workshopRoutes.js',
        './routes/referralRoutes.js',
        './routes/magazineRoutes.js'
        // Add more routes as they're created
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;