/**
 * Database seed file
 * Run: npm run prisma:seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookmyforex.com' },
    update: {},
    create: {
      email: 'admin@bookmyforex.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+919999999999',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      referralCode: 'ADMIN001',
      isActive: true
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample users
  const userPassword = await bcrypt.hash('User@123', 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        password: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+919876543210',
        role: 'USER',
        kycStatus: 'VERIFIED',
        referralCode: 'JODO001',
        walletBalance: 500
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        password: userPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+919876543211',
        role: 'USER',
        kycStatus: 'SUBMITTED',
        referralCode: 'JASM002'
      }
    })
  ]);
  console.log('✅ Sample users created');

  // Create currency rates
  const rates = [
    { currencyCode: 'USD', currencyName: 'US Dollar', baseRate: 83.50, buyRate: 82.00, sellRate: 85.00, markup: 2.0 },
    { currencyCode: 'EUR', currencyName: 'Euro', baseRate: 91.20, buyRate: 89.50, sellRate: 92.90, markup: 2.0 },
    { currencyCode: 'GBP', currencyName: 'British Pound', baseRate: 106.80, buyRate: 105.00, sellRate: 108.60, markup: 2.0 },
    { currencyCode: 'AED', currencyName: 'UAE Dirham', baseRate: 22.75, buyRate: 22.30, sellRate: 23.20, markup: 2.0 },
    { currencyCode: 'AUD', currencyName: 'Australian Dollar', baseRate: 54.60, buyRate: 53.50, sellRate: 55.70, markup: 2.0 },
    { currencyCode: 'CAD', currencyName: 'Canadian Dollar', baseRate: 61.40, buyRate: 60.20, sellRate: 62.60, markup: 2.0 },
    { currencyCode: 'SGD', currencyName: 'Singapore Dollar', baseRate: 62.30, buyRate: 61.10, sellRate: 63.50, markup: 2.0 },
    { currencyCode: 'CHF', currencyName: 'Swiss Franc', baseRate: 95.80, buyRate: 94.00, sellRate: 97.60, markup: 2.0 },
    { currencyCode: 'JPY', currencyName: 'Japanese Yen', baseRate: 0.56, buyRate: 0.55, sellRate: 0.57, markup: 2.0 },
    { currencyCode: 'CNY', currencyName: 'Chinese Yuan', baseRate: 11.50, buyRate: 11.30, sellRate: 11.70, markup: 2.0 }
  ];

  for (const rate of rates) {
    await prisma.rate.upsert({
      where: { currencyCode: rate.currencyCode },
      update: rate,
      create: rate
    });
  }
  console.log('✅ Currency rates created');

  // Create partners
  const partners = [
    {
      name: 'Delhi Forex Exchange',
      email: 'delhi@forexexchange.com',
      phone: '+911234567890',
      city: 'New Delhi',
      state: 'Delhi',
      rating: 4.5,
      commissionRate: 1.5,
      deliveryEnabled: true
    },
    {
      name: 'Mumbai Currency Hub',
      email: 'mumbai@currencyhub.com',
      phone: '+912234567890',
      city: 'Mumbai',
      state: 'Maharashtra',
      rating: 4.7,
      commissionRate: 1.8,
      deliveryEnabled: true
    },
    {
      name: 'Bangalore Forex Center',
      email: 'bangalore@forexcenter.com',
      phone: '+918034567890',
      city: 'Bangalore',
      state: 'Karnataka',
      rating: 4.3,
      commissionRate: 1.6,
      deliveryEnabled: true
    },
    {
      name: 'Chennai Money Exchange',
      email: 'chennai@moneyexchange.com',
      phone: '+914434567890',
      city: 'Chennai',
      state: 'Tamil Nadu',
      rating: 4.4,
      commissionRate: 1.7,
      deliveryEnabled: false
    }
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { email: partner.email },
      update: partner,
      create: partner
    });
  }
  console.log('✅ Partners created');

  // Create offers
  const offers = [
    {
      title: 'Welcome Offer',
      description: 'Get 10% off on your first transaction',
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minAmount: 1000,
      maxDiscount: 500,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      usageLimit: 1000
    },
    {
      title: 'Flat ₹200 Off',
      description: 'Flat ₹200 discount on orders above ₹5000',
      code: 'FLAT200',
      discountType: 'FLAT',
      discountValue: 200,
      minAmount: 5000,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      usageLimit: 500
    },
    {
      title: 'Cashback Bonanza',
      description: 'Get 5% cashback in wallet',
      code: 'CASHBACK5',
      discountType: 'CASHBACK',
      discountValue: 5,
      minAmount: 2000,
      maxDiscount: 1000,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31')
    }
  ];

  for (const offer of offers) {
    await prisma.offer.upsert({
      where: { code: offer.code },
      update: offer,
      create: offer
    });
  }
  console.log('✅ Offers created');

  // Create sample addresses for users
  await prisma.address.createMany({
    data: [
      {
        userId: users[0].id,
        type: 'HOME',
        line1: '123 Main Street',
        line2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        isDefault: true
      },
      {
        userId: users[1].id,
        type: 'OFFICE',
        line1: '456 Business Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        isDefault: true
      }
    ],
    skipDuplicates: true
  });
  console.log('✅ Sample addresses created');

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@bookmyforex.com / Admin@123');
  console.log('User: john.doe@example.com / User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
