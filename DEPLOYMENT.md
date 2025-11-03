# PocketOption Clone - Production Deployment Guide

This guide will help you deploy the PocketOption clone to production using MongoDB Atlas, Render.com, and Netlify.

## Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Render.com account (free)
- Netlify account (free)

## Step 1: Set up MongoDB Atlas Database

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new project called "PocketOption"

2. **Create Database Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free tier)
   - Select your preferred cloud provider and region
   - Name your cluster "Cluster0"
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `pocketoption`
   - Password: `SecurePassword123` (or generate a secure password)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `pocketoption`

   Example: `mongodb+srv://pocketoption:SecurePassword123@cluster0.abc123.mongodb.net/pocketoption?retryWrites=true&w=majority`

## Step 2: Push Code to GitHub

1. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Name it "pocketoption-clone"
   - Make it public or private (your choice)

2. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PocketOption clone"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pocketoption-clone.git
   git push -u origin main
   ```

## Step 3: Deploy Backend to Render.com

1. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up and connect your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `pocketoption-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Set Environment Variables**
   - In the service settings, add these environment variables:
     ```
     NODE_ENV=production
     DATABASE_URL=mongodb+srv://pocketoption:SecurePassword123@cluster0.abc123.mongodb.net/pocketoption?retryWrites=true&w=majority
     JWT_SECRET=super-secure-jwt-secret-key-for-production-2024
     SMTP_EMAIL=noreply.pocketoption@gmail.com
     SMTP_PASSWORD=your-app-password
     REVIEWS_EMAIL=reviews@pocketoption.com
     ALPHA_VANTAGE_API_KEY=demo
     NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=demo
     ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://pocketoption-backend.onrender.com`)

## Step 4: Deploy Frontend to Netlify

1. **Create Netlify Account**
   - Go to [Netlify](https://netlify.com)
   - Sign up and connect your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - **Branch**: `main`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
     ```

4. **Update netlify.toml**
   - The `netlify.toml` file is already configured
   - Update the backend URL in the redirects section to match your Render URL

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://amazing-site-name.netlify.app`)

## Step 5: Update Frontend API Configuration

1. **Update API Base URL**
   - The frontend should automatically use the `NEXT_PUBLIC_API_URL` environment variable
   - Verify all API calls are using the production backend URL

## Step 6: Test Deployment

1. **Test Backend Health**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return a healthy status with database connection confirmed

2. **Test Frontend**
   - Visit your Netlify URL
   - Test user registration and login
   - Verify trading functionality
   - Check admin panel access

## Step 7: Final Configuration

1. **Update CORS Settings** (if needed)
   - Ensure your backend accepts requests from your Netlify domain

2. **SSL Certificates**
   - Both Render and Netlify provide free SSL certificates automatically

3. **Custom Domain** (optional)
   - Configure custom domains in both Render and Netlify if desired

## Environment Variables Summary

### Backend (Render.com)
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://pocketoption:SecurePassword123@cluster0.abc123.mongodb.net/pocketoption?retryWrites=true&w=majority
JWT_SECRET=super-secure-jwt-secret-key-for-production-2024
SMTP_EMAIL=noreply.pocketoption@gmail.com
SMTP_PASSWORD=your-app-password
REVIEWS_EMAIL=reviews@pocketoption.com
ALPHA_VANTAGE_API_KEY=demo
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=demo
```

### Frontend (Netlify)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

## Troubleshooting

1. **Database Connection Issues**
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check connection string format
   - Ensure database user has proper permissions

2. **Build Failures**
   - Check build logs in Render/Netlify
   - Verify all environment variables are set
   - Ensure Prisma generates correctly

3. **API Connection Issues**
   - Verify CORS settings
   - Check network requests in browser dev tools
   - Ensure API URLs are correct

## Final URLs

After successful deployment, you should have:

- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://pocketoption-backend.onrender.com`
- **Database**: MongoDB Atlas cluster
- **Health Check**: `https://pocketoption-backend.onrender.com/api/health`

## Auto-Deployment

Both services are configured for auto-deployment:
- **Render**: Automatically deploys when you push to the `main` branch
- **Netlify**: Automatically deploys when you push to the `main` branch

Your PocketOption clone is now live in production! 🚀