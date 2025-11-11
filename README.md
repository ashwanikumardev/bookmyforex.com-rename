# BookMyForex - Forex Marketplace Platform

A full-stack web application for foreign exchange services including currency exchange, forex cards, and international money transfers. Built with Next.js, Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Features

### User Features
- **Live Exchange Rates**: Real-time forex rates updated via WebSocket
- **Buy/Sell Currency**: Order foreign currency cash with doorstep delivery
- **Forex Cards**: Multi-currency prepaid travel cards
- **Send Money Abroad**: International money transfer services
- **KYC Verification**: Secure document upload and verification
- **Order Tracking**: Track order status in real-time
- **Rate Alerts**: Get notified when rates reach your target
- **Referral System**: Earn rewards by referring friends
- **Wallet**: Manage cashback and rewards

### Admin Features
- **Dashboard**: Overview of orders, users, and revenue
- **User Management**: Manage users and KYC verification
- **Order Management**: Track and update order status
- **Rate Management**: Update forex rates in real-time
- **Partner Management**: Manage money exchanger partners
- **Offer Management**: Create and manage promotional offers
- **Audit Logs**: Complete transaction history and logs

### Technical Features
- **JWT Authentication**: Secure user authentication
- **Real-time Updates**: WebSocket for live rate updates
- **Payment Integration**: Razorpay payment gateway
- **Email/SMS Notifications**: Automated notifications
- **Rate Limiting**: API rate limiting for security
- **Input Validation**: Comprehensive validation
- **Responsive Design**: Mobile-first responsive UI
- **Dark Mode Support**: Light and dark themes

## 📁 Project Structure

```
bookmyforex/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── server.js       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js         # Seed data
│   ├── package.json
│   └── .env.example
│
├── frontend/               # Next.js + React frontend
│   ├── app/               # Next.js 14 app directory
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   ├── store/             # Zustand state management
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Real-time**: Socket.io
- **Payment**: Razorpay
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bookmyforex.com
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Database URL
# - JWT secret
# - Razorpay keys
# - Email/SMS credentials
```

**Configure `.env` file:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/bookmyforex"
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
# ... other variables
```

**Setup Database:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

**Start Backend Server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
```

**Configure `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Start Frontend Server:**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend will run on `http://localhost:3000`

## 🔑 Default Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Email: `admin@bookmyforex.com`
- Password: `Admin@123`

**Test User Account:**
- Email: `john.doe@example.com`
- Password: `User@123`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Rate Endpoints
- `GET /api/rates` - Get all active rates
- `GET /api/rates/:currencyCode` - Get specific currency rate
- `POST /api/rates/calculate` - Calculate transaction amount
- `POST /api/rates/alert` - Create rate alert

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/cancel` - Cancel order

### Payment Endpoints
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/transactions` - Get transactions

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/kyc` - Update KYC status
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/rates` - Create/update rates
- `POST /api/admin/partners` - Manage partners
- `POST /api/admin/offers` - Manage offers

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive validation
- **CORS**: Configured CORS policy
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Input sanitization

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Set environment variables
2. Connect PostgreSQL database
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Connect repository
2. Set environment variables
3. Build command: `npm run build`
4. Deploy

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=production
JWT_SECRET=...
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASSWORD=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=https://your-backend-url.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📊 Database Schema

Key models:
- **User**: User accounts with KYC
- **Order**: Forex orders
- **Rate**: Currency exchange rates
- **Partner**: Money exchanger partners
- **Transaction**: Payment transactions
- **Offer**: Promotional offers
- **RateAlert**: User rate alerts
- **Referral**: Referral tracking
- **AuditLog**: System audit logs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@bookmyforex.com or create an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- All open-source contributors

---

**Built with ❤️ for the forex marketplace**
