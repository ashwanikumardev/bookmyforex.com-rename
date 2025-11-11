# 🚀 Quick Start Guide

Get BookMyForex up and running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
psql --version  # Should be 14+
```

## Step 1: Database Setup (2 minutes)

```bash
# Create database
psql -U postgres
CREATE DATABASE bookmyforex;
\q
```

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env - MINIMUM required:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/bookmyforex"
# JWT_SECRET="any-long-random-string-min-32-chars"

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run dev
```

✅ Backend running on http://localhost:5000

## Step 3: Frontend Setup (1 minute)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

## Step 4: Login & Test

Open http://localhost:3000

**Admin Login:**
- Email: `admin@bookmyforex.com`
- Password: `Admin@123`

**User Login:**
- Email: `john.doe@example.com`
- Password: `User@123`

## 🎉 You're Done!

### What's Working:
- ✅ Live forex rates with real-time updates
- ✅ User registration and login
- ✅ Order creation (KYC verified users only)
- ✅ Admin dashboard
- ✅ Rate management
- ✅ User management

### What Needs Configuration (Optional):
- ⚠️ **Razorpay**: For actual payments (test mode works without keys)
- ⚠️ **Email**: For sending emails (logs to console by default)
- ⚠️ **SMS**: For sending SMS (logs to console by default)

## Common Issues

### "Database connection failed"
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### "Port 5000 already in use"
```bash
# Change PORT in backend/.env to 5001
PORT=5001
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Explore Features**
   - Browse live rates
   - Create a test order (login as john.doe@example.com)
   - Access admin panel (login as admin)

2. **Customize**
   - Update branding in `frontend/app/page.tsx`
   - Modify rates in admin panel
   - Add new currencies

3. **Configure Services** (See SETUP_GUIDE.md)
   - Razorpay for payments
   - SendGrid for emails
   - Twilio for SMS

## File Structure

```
bookmyforex/
├── backend/           # Node.js API
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── .env          # Configuration
│
├── frontend/         # Next.js app
│   ├── app/         # Pages
│   ├── components/  # UI components
│   └── .env.local   # Configuration
│
├── README.md        # Full documentation
├── SETUP_GUIDE.md   # Detailed setup
└── QUICKSTART.md    # This file
```

## Key Features

### For Users:
- Live exchange rates
- Buy/Sell currency
- Forex cards
- Send money abroad
- Order tracking
- Rate alerts

### For Admins:
- Dashboard with stats
- User management
- Order management
- Rate updates
- Partner management
- Offer creation

## Support

Need help? Check:
1. SETUP_GUIDE.md for detailed instructions
2. README.md for full documentation
3. Console logs for error messages

---

**Happy coding! 🎉**
