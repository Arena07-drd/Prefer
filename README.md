# Billing App 2.0

A comprehensive 3-tier billing application comprising a Node.js backend, a React admin dashboard, and a mobile application, backed by MongoDB.

## Architecture

```
+----------------+      +-----------------+      +-------------+
|                |      |                 |      |             |
|  React Admin   |----->|  Node.js API    |----->|  MongoDB    |
|  Dashboard     |      |  (Express)      |      |             |
|                |      |                 |      |             |
+----------------+      +-----------------+      +-------------+
        ^                       ^
        |                       |
        |                       |
+----------------+              |
|                |              |
|  Mobile App    |--------------+
|  (React Native)|
|                |
+----------------+
```

## Tech Stack
- **Backend:** Node.js 20+, Express 5.x, MongoDB 7+, Mongoose, Joi, Argon2
- **Admin Dashboard:** React, Vite
- **Mobile App:** React Native, Expo
- **Infrastructure:** Docker, Docker Compose, Nginx

## Prerequisites
- Node.js 20+
- MongoDB 7+
- npm

## Quick Start Instructions

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "billing app 2.0"
   ```

2. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run seed
   npm run dev
   ```

3. **Admin setup:**
   ```bash
   cd admin
   npm install
   npm run dev
   ```

4. **Mobile setup:**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## Default Credentials
- **Email:** admin@business.com
- **Password:** Admin@123456

## Environment Variables
- `PORT`: API Port (default 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secrets for JWT auth
- `CORS_ORIGIN`: Allowed origins for CORS

## API Endpoints Summary
- `/api/auth/*`: Authentication endpoints (login, refresh, logout)
- `/api/users/*`: User management
- `/api/customers/*`: Customer management
- `/api/invoices/*`: Invoice generation and management
- `/api/health`: System health check

## Project Structure Overview
- `/backend`: Node.js/Express REST API
- `/admin`: React SPA for admin dashboard
- `/mobile`: React Native mobile application
- `/nginx`: Nginx configuration for production deployment

## Docker Deployment
To deploy using Docker Compose:

```bash
docker-compose up -d --build
```
This will start MongoDB, the Node.js API, the Admin Dashboard, and an Nginx reverse proxy.
