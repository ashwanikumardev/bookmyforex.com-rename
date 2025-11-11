# BookMyForex - Complete Setup Guide

This guide will walk you through setting up the BookMyForex application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Third-Party Services](#third-party-services)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`
  
- **npm**: Version 9.x or higher (comes with Node.js)
  - Verify: `npm --version`
  
- **PostgreSQL**: Version 14.x or higher
  - Download from: https://www.postgresql.org/download/
  - Verify: `psql --version`
  
- **Git**: Latest version
  - Download from: https://git-scm.com/
  - Verify: `git --version`

### Optional Tools
- **Prisma Studio**: Database GUI (included with Prisma)
- **Postman**: API testing
- **VS Code**: Recommended code editor

## Database Setup

### 1. Install PostgreSQL

**Windows:**
```bash
# Download installer from postgresql.org
# Run installer and follow prompts
# Remember the password you set for postgres user
```

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bookmyforex;

# Create user (optional)
CREATE USER bookmyforex_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookmyforex TO bookmyforex_user;

# Exit
\q
```

### 3. Get Database URL

Your database URL format:
```
postgresql://username:password@localhost:5432/bookmyforex
```

Example:
```
postgresql://postgres:mypassword@localhost:5432/bookmyforex
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- express
- prisma
- bcryptjs
- jsonwebtoken
- socket.io
- razorpay
- nodemailer
- twilio
- And more...

### 3. Configure Environment Variables

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/bookmyforex?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (SendGrid or SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@bookmyforex.com

# Twilio (Get from https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Exchange Rate API (Optional - for live rates)
EXCHANGE_RATE_API_KEY=your_api_key
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Setup Prisma and Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 5. Create Upload Directories

```bash
# Windows
mkdir uploads\kyc

# macOS/Linux
mkdir -p uploads/kyc
```

### 6. Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server should start on `http://localhost:5000`

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
🌐 Frontend URL: http://localhost:3000
✅ Database connected successfully
```

## Frontend Setup

### 1. Navigate to Frontend Directory

Open a new terminal:
```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- next
- react
- tailwindcss
- axios
- socket.io-client
- zustand
- react-query
- And more...

### 3. Configure Environment Variables

Copy the example file:
```bash
# Windows
copy .env.local.example .env.local

# macOS/Linux
cp .env.local.example .env.local
```

Edit `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 4. Start Frontend Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend should start on `http://localhost:3000`

## Third-Party Services

### 1. Razorpay (Payment Gateway)

1. Sign up at https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Add keys to `.env` files (both backend and frontend)

**Test Mode:**
- Use test keys (starting with `rzp_test_`)
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### 2. SendGrid (Email Service)

1. Sign up at https://sendgrid.com/
2. Create API key in Settings → API Keys
3. Verify sender email
4. Add credentials to backend `.env`

**Alternative: Use Gmail SMTP**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Twilio (SMS Service)

1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token from Console
3. Get a phone number
4. Add credentials to backend `.env`

**Note:** Twilio trial accounts can only send to verified numbers.

### 4. Exchange Rate API (Optional)

For live forex rates:
1. Sign up at https://exchangerate-api.com/ or similar
2. Get API key
3. Add to backend `.env`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Prisma Studio**: Run `npm run prisma:studio` in backend directory

### Test Accounts

**Admin:**
- Email: admin@bookmyforex.com
- Password: Admin@123

**User:**
- Email: john.doe@example.com
- Password: User@123

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Start PostgreSQL if not running
# Windows: Start from Services
# macOS: brew services start postgresql@14
# Linux: sudo systemctl start postgresql
```

**Error: "Authentication failed"**
- Check DATABASE_URL in `.env`
- Verify username and password
- Ensure database exists

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Prisma Issues

**Error: "Prisma Client not generated"**
```bash
cd backend
npm run prisma:generate
```

**Error: "Migration failed"**
```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset

# Or manually drop and recreate
psql -U postgres
DROP DATABASE bookmyforex;
CREATE DATABASE bookmyforex;
\q

# Then run migrations again
npm run prisma:migrate
npm run prisma:seed
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

### CORS Errors

- Ensure FRONTEND_URL in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/src/server.js`

### WebSocket Connection Issues

- Ensure WS_URL in frontend `.env.local` is correct
- Check firewall settings
- Verify backend WebSocket server is running

## Next Steps

1. **Explore the Application**
   - Register a new user
   - Browse live rates
   - Create a test order
   - Test admin dashboard

2. **Customize**
   - Update branding and colors
   - Modify email templates
   - Add new features

3. **Deploy**
   - See README.md for deployment instructions
   - Use Railway/Render for backend
   - Use Vercel/Netlify for frontend

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Express Docs**: https://expressjs.com/
- **TailwindCSS Docs**: https://tailwindcss.com/docs

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review error messages carefully
3. Check console logs (browser and terminal)
4. Search for similar issues online
5. Create an issue in the repository

---

**Happy Coding! 🚀**
