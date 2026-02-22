# Portfolio Project - Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Database Setup

### 1. Install MySQL
Download and install MySQL from https://dev.mysql.com/downloads/

### 2. Create Database
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source database/schema.sql

# Or manually create the database
CREATE DATABASE portfolio_db;
USE portfolio_db;
```

### 3. Configure Environment
Edit the `.env` file in the root directory:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db
DB_PORT=3306
PORT=5000
JWT_SECRET=your_secret_key_here
```

## Installation

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### Option 2: Run Both Together
```bash
npm run dev:full
```

## Access the Application

- **Public Portfolio:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login
- **API:** http://localhost:5000/api

## Default Admin Credentials

You'll need to create an admin user. Run this SQL:

```sql
USE portfolio_db;

-- Create admin user (username: admin, password: admin123)
INSERT INTO admin (username, password_hash, email) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@portfolio.com');
```

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials after first login!

## Project Structure

```
portfolio/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── client/                # Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── context/       # React Context (Theme, Auth)
│       ├── pages/         # Page components
│       │   ├── public/   # Public portfolio pages
│       │   └── admin/    # Admin dashboard pages
│       ├── App.js
│       └── index.js
├── database/              # Database schema
├── package.json
└── .env
```

## Features

### Public Portfolio
- ✅ Hero section with profile image
- ✅ About section
- ✅ Skills display
- ✅ Projects grid with details
- ✅ Individual project pages
- ✅ Contact links
- ✅ Dark/Light mode toggle
- ✅ Fully responsive

### Admin Dashboard
- ✅ Secure authentication
- ✅ Profile management
- ✅ Add/Edit/Delete projects
- ✅ Add/Edit/Delete skills
- ✅ Upload profile image (via URL)
- ✅ Manage project videos and links
- ✅ Real-time updates

## Tech Stack

**Frontend:**
- Native React (no frameworks)
- React Router
- React Context API
- CSS3

**Backend:**
- Node.js
- Express.js
- MySQL
- JWT Authentication

## Security Notes

1. Never commit the `.env` file
2. Change the default admin password immediately
3. Use strong JWT_SECRET in production
4. Enable HTTPS in production
5. Set up proper CORS in production

## Troubleshooting

**Database Connection Error:**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `portfolio_db` exists

**Port Already in Use:**
- Change PORT in `.env` file
- Kill the process using the port

**Cannot Login:**
- Verify admin user exists in database
- Check password hash is correct
- Clear browser localStorage

## Production Deployment

1. Build the React app: `cd client && npm run build`
2. Set NODE_ENV=production in `.env`
3. Use a process manager like PM2
4. Set up nginx as reverse proxy
5. Enable SSL/TLS
6. Use environment-specific database

## Support

For issues or questions, check the code comments or create an issue in the repository.
