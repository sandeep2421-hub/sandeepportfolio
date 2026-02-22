# Portfolio Hosting Guide

## Important: File Storage Issue ⚠️

### Current Problem
Files uploaded through admin panel are stored as:
```
http://localhost:5000/uploads/resume.pdf
http://localhost:5000/uploads/project-image.png
```

**These will NOT work after hosting!**

---

## Solution Options

### Option 1: Use External File Hosting (Recommended ✅)

#### For Resume PDF:
1. Upload to **Google Drive**:
   - Upload your resume
   - Right-click → Share → Anyone with link can view
   - Copy the link (format: `https://drive.google.com/file/d/FILE_ID/view`)
   - Convert to direct download: `https://drive.google.com/uc?export=download&id=FILE_ID`

2. Or use **Cloudinary** (Free tier available):
   - Sign up at cloudinary.com
   - Upload resume
   - Copy the public URL
   - Paste in admin panel

#### For Project Images:
1. **Imgur** (easiest):
   - Upload image to imgur.com
   - Copy direct link
   - Paste in admin panel

2. **Cloudinary**:
   - Same as resume process

### Option 2: Host Files with Backend

When you deploy your backend (e.g., on Render, Railway, or Heroku):
- The `/uploads` folder will be included
- Files will be accessible at: `https://your-backend-domain.com/uploads/file.pdf`

**Steps:**
1. Deploy backend to a hosting service
2. Update all localhost URLs in database to your backend URL
3. Or re-upload files through admin panel after hosting

---

## LinkedIn URL - NOW FIXED! ✅

You can now enter LinkedIn URL in these formats:
- `www.linkedin.com/in/sandeepkumar`
- `linkedin.com/in/sandeepkumar`
- `https://www.linkedin.com/in/sandeep-kumar-a13b8a379/`

The system will automatically add `https://` when saving!

---

## Recommended Hosting Services

### Frontend (React):
- **Vercel** (Free, easy) ⭐
- **Netlify** (Free)
- **GitHub Pages**

### Backend (Node.js + MySQL):
- **Railway** (Free tier) ⭐
- **Render** (Free tier)
- **Heroku** (Paid)

### Database (MySQL):
- **Railway** (included with backend)
- **PlanetScale** (Free tier)
- **AWS RDS** (Free tier for 12 months)

---

## Quick Tips

1. **Before Hosting:**
   - Use external links for resume/images
   - Test all URLs work
   - Update email in contact form

2. **Environment Variables:**
   - Don't commit `.env` file
   - Set environment variables in hosting platform

3. **Database:**
   - Export your local database
   - Import to production database
   - Update database connection in backend

---

## Need Help?
- All URL fields now accept flexible formats
- System auto-adds `https://` when needed
- Use external hosting for files before deploying
