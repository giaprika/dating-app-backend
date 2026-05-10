import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dating App Backend API",
      version: "1.0.0",
      description: "API documentation for Dating App Backend",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            user_id: { type: "integer" },
            email: { type: "string" },
            full_name: { type: "string" },
            birth_date: { type: "string", format: "date" },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
            },
            bio: { type: "string" },
            default_mode: {
              type: "string",
              enum: ["traditional", "anonymous"],
            },
            created_at: { type: "string", format: "date-time" },
          },
        },
        UserPreference: {
          type: "object",
          properties: {
            preference_id: { type: "integer" },
            user_id: { type: "integer" },
            target_gender: {
              type: "string",
              enum: ["male", "female", "other"],
            },
            min_age: { type: "integer" },
            max_age: { type: "integer" },
            max_distance_km: { type: "integer" },
            anonymous_interests: { type: "array", items: { type: "string" } },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        UserPhoto: {
          type: "object",
          properties: {
            photo_id: { type: "integer" },
            user_id: { type: "integer" },
            image_url: { type: "string" },
            is_primary: { type: "boolean" },
            display_order: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            statusCode: { type: "integer" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            statusCode: { type: "integer" },
            message: { type: "string" },
            errors: { type: "array" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/userRoutes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
