# Deployment Guide - Vercel with Cloudinary

## 🌟 Overview
This guide will help you deploy your portfolio to Vercel with cloud-hosted images and documents using Cloudinary.

## 📋 Prerequisites
- Vercel account (free at https://vercel.com)
- Cloudinary account (free at https://cloudinary.com)
- Your portfolio code

## Part 1: Setting Up Cloudinary

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Complete the registration

### Step 2: Get Your Cloudinary Credentials
1. After login, go to the Dashboard
2. You'll see these credentials:
   - **Cloud Name**: (e.g., `dxxxxxxxxxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz`)
3. Copy these values - you'll need them next

### Step 3: Update Local .env File
Open your `.env` file and update with your Cloudinary credentials:

```env
# Replace these with your actual Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 4: Test Locally
1. Save the .env file
2. Restart your server: `npm run dev:full`
3. Go to Admin Dashboard
4. Try uploading an image or resume
5. It should now upload to Cloudinary instead of local storage

## Part 2: Deploying to Vercel

### Step 1: Prepare Your Code for Deployment

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

### Step 2: Update Database Configuration

You'll need a hosted MySQL database. Options:
1. **PlanetScale** (Recommended - Free tier available)
   - Go to https://planetscale.com
   - Create a database
   - Get connection string

2. **Railway** (Alternative)
   - Go to https://railway.app
   - Create MySQL database
   - Get connection details

3. **Heroku ClearDB** (Another option)
   - Go to https://www.heroku.com
   - Add ClearDB MySQL add-on

### Step 3: Deploy to Vercel

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   In Vercel project settings, add these environment variables:
   
   ```
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=portfolio_db
   DB_PORT=3306
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be live at `your-project.vercel.app`

## Part 3: Post-Deployment Setup

### Step 1: Set Up Database
1. Connect to your production database
2. Run the database schema from `database/schema.sql`
3. Create admin account using `scripts/generate-admin-hash.js`

### Step 2: Test Everything
- ✅ Access your portfolio
- ✅ Log in to admin panel
- ✅ Upload images (should go to Cloudinary)
- ✅ Upload resume (should go to Cloudinary)
- ✅ Download resume (should work from Cloudinary URL)
- ✅ View projects with images

## 🎯 Why Cloudinary?

### Benefits:
1. **Persistent Storage**: Files won't disappear after Vercel redeployments
2. **CDN**: Fast image delivery worldwide
3. **Free Tier**: 25GB storage, 25GB bandwidth/month
4. **Image Optimization**: Automatic image compression and optimization
5. **Reliability**: 99.9% uptime

### How It Works:
- When you upload an image/PDF through admin panel
- File goes to Cloudinary cloud storage
- Cloudinary returns a permanent URL
- URL is saved in your database
- Frontend displays images from Cloudinary URLs
- Works perfectly on Vercel and any hosting platform

## 🔧 Troubleshooting

### Images Not Uploading?
1. Check Cloudinary credentials in Vercel environment variables
2. Check browser console for errors
3. Verify Cloudinary dashboard shows uploads

### Resume Download Not Working?
1. Make sure resume_url in database is Cloudinary URL
2. Check that URL is publicly accessible
3. Verify PDF uploaded with `resource_type: 'raw'`

### Database Connection Issues?
1. Verify database credentials in Vercel
2. Check if database allows external connections
3. Ensure database is online and accessible

## 📝 Important Notes

1. **Local Development**: Still works! Just update .env with Cloudinary credentials
2. **Old Local Files**: You can delete the `server/uploads` folder - no longer needed
3. **Existing Data**: Re-upload any existing images/resumes through admin panel
4. **Security**: Never commit .env file to GitHub (already in .gitignore)

## 🚀 Next Steps

After successful deployment:
1. Add custom domain in Vercel settings
2. Enable HTTPS (automatic with Vercel)
3. Monitor Cloudinary usage in dashboard
4. Set up automated backups for database

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Cloudinary Docs: https://cloudinary.com/documentation
- Contact support through their respective platforms
