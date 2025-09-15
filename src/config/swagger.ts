import { config } from './config';

import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Posts API',
      version: '1.0.0',
      description: 'A REST API for managing blog posts with tags and image uploads',
      contact: {
        name: 'API Support',
        email: 'support@postsapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : `http://localhost:${config.port}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        Post: {
          type: 'object',
          required: ['title', 'description', 'imageUrl'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated unique identifier for the post'
            },
            title: {
              type: 'string',
              description: 'Title of the post',
              maxLength: 200
            },
            description: {
              type: 'string',
              description: 'Detailed description of the post',
              maxLength: 5000
            },
            imageUrl: {
              type: 'string',
              description: 'URL of the uploaded image'
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              },
              description: 'Array of tags associated with the post'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Post creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Post last update timestamp'
            }
          }
        },
        Tag: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated unique identifier for the tag'
            },
            name: {
              type: 'string',
              description: 'Name of the tag',
              maxLength: 50
            },
            slug: {
              type: 'string',
              description: 'URL-friendly version of the tag name'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tag creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tag last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message description'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page'
            },
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Post not found'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Server error while processing request'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Validation failed: title is required'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // files containing annotations
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;