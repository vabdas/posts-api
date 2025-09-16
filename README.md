# Posts API 🚀

A robust RESTful API built with Node.js, TypeScript, and Express for managing blog posts with tags and image uploads. Features comprehensive Swagger documentation, Cloudinary integration, and MongoDB storage.

## ✨ Features

- **Post Management**: Create, read, update, and delete posts
- **Tag System**: Categorize posts with multiple tags
- **Image Uploads**: Cloudinary integration for image storage
- **Advanced Search**: Full-text search across post titles and descriptions
- **Pagination & Filtering**: Efficient data retrieval with sorting options
- **Swagger Documentation**: Interactive API documentation
- **TypeScript**: Full type safety and better developer experience
- **Docker Support**: Containerized deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)
- Railway account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/posts-api.git
   cd posts-api

2. Install dependencies
   npm install

3. Environment Configuration
   cp .env.example .env
   Edit .env with your configuration:

   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb+srv://admin:admin123@posts-api.7nxqo6f.mongodb.net/?retryWrites=true&w=majority&appName=posts-api
   CLOUDINARY_CLOUD_NAME=dourrd3af
   CLOUDINARY_API_KEY=917583321229881
   CLOUDINARY_API_SECRET=XoD4Ik1kKTrw-4uzqDJzYrmxh_E

4. Database Setup
   npm run init-db

5. Run the application
   # Development mode
   npm run dev
  
   # Production mode
   npm run build
   npm start
   
6. Access the API
   
     API: http://localhost:3000
     Documentation: http://localhost:3000/api-docs
     Health Check: http://localhost:3000/health
  
     API Endpoints
      Posts
        GET /api/posts - Get all posts with pagination and filtering
        POST /api/posts - Create a new post with image upload
        GET /api/posts/:id - Get a specific post
        PUT /api/posts/:id - Update a post
        DELETE /api/posts/:id - Delete a post
     
     Tags
        GET /api/tags - Get all tags
        POST /api/tags - Create a new tag
        
     Search
        GET /api/search?q=query - Search posts by keyword
  
     # Build the image
  docker build -t posts-api .

   # Run the container
   docker run -p 3000:3000 \
     -e MONGODB_URI=mongodb+srv://admin:admin123@posts-api.7nxqo6f.mongodb.net/?retryWrites=true&w=majority&appName=posts-api \
     -e CLOUDINARY_CLOUD_NAME=dourrd3af \
     -e CLOUDINARY_API_KEY=917583321229881 \
     -e CLOUDINARY_API_SECRET=XoD4Ik1kKTrw-4uzqDJzYrmxh_E \
     posts-api


☁️ Railway Deployment
1. Install Railway CLI
   npm install -g @railway/cli

2. Login and deploy
    railway login
    railway link
    railway deploy

3. Set environment variables
    railway variables set MONGODB_URI=mongodb+srv://admin:admin123@posts-api.7nxqo6f.mongodb.net/?retryWrites=true&w=majority&appName=posts-api
    railway variables set CLOUDINARY_CLOUD_NAME=dourrd3af
    railway variables set CLOUDINARY_API_KEY=917583321229881
    railway variables set CLOUDINARY_API_SECRET=XoD4Ik1kKTrw-4uzqDJzYrmxh_E
    railway variables set NODE_ENV=production

LOOM VIDEO
PART 1: https://www.loom.com/share/afe3d2bf6a1948db9e5ec389dc5cf3ee
PART 2: https://www.loom.com/share/60e4a370b9e640f09f97d379a6063d6d
