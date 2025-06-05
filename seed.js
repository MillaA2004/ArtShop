const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

// Sample products data
const sampleProducts = [
  {
    name: 'Pose',
    description: 'Professional character posing reference and tutorial.',
    price: 30,
    category: 'digital art',
    stock: 1,
    image: '/img/shadows.jpg'
  },
  {
    name: 'MediBang Pro',
    description: 'Professional digital art software with advanced features for artists.',
    price: 20,
    category: 'software',
    stock: 10,
    image: '/img/medibang.png'
  },
  {
    name: 'Pro Create',
    description: 'Industry-leading digital art software for iPad users.',
    price: 20,
    category: 'software',
    stock: 10,
    image: '/img/procreate.png'
  },
  {
    name: 'Portrait',
    description: 'Digital portrait creation course with professional techniques.',
    price: 35,
    category: 'digital art',
    stock: 5,
    image: '/img/purple-portrait.jpg'
  },
  {
    name: 'Flower',
    description: 'Traditional flower painting techniques and materials.',
    price: 30,
    category: 'traditional art',
    stock: 3,
    image: '/img/flower.jpg'
  },
  {
    name: 'Dragon',
    description: 'Fantasy creature illustration course for traditional artists.',
    price: 15,
    category: 'traditional art',
    stock: 5,
    image: '/img/dragon.jpg'
  },
  {
    name: 'Character Poses',
    description: 'Dynamic character pose reference pack for artists.',
    price: 25,
    category: 'digital art',
    stock: 15,
    image: '/img/poses.jpg'
  },
  {
    name: 'Digital Portrait Pack',
    description: 'Complete digital portrait creation toolkit and course.',
    price: 40,
    category: 'digital art',
    stock: 50,
    image: '/img/digital_portrait.jpg'
  }
];

// Sample admin user
const adminUser = {
  email: 'admin@artsy.com',
  password: 'admin123',
  fullName: 'Admin User',
  role: 'admin',
  address: {
    street: '123 Admin Street',
    city: 'Art City',
    state: 'Creative State',
    zip: '12345'
  }
};

// Sample TEST admin user (NEW)
const testAdminUser = {
  email: 'testadmin@artsy.com',
  password: 'testadmin123',
  fullName: 'Test Admin User',
  role: 'admin',
  address: {
    street: '456 Test Avenue',
    city: 'Testville',
    state: 'Testing State',
    zip: '67890'
  }
};

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/artsy-store';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${products.length} products`);

    // Find or create/update admin user (admin@artsy.com)
    let admin = await User.findOne({ email: adminUser.email });
    
    if (!admin) {
      console.log('Admin user (admin@artsy.com) not found, creating new one...');
      admin = new User(adminUser);
      await admin.save();
      console.log('Created new admin user (admin@artsy.com) with role: admin');
    } else {
      if (admin.role !== 'admin') {
        console.log('Admin user (admin@artsy.com) found, but role is not admin. Updating role...');
        admin.role = 'admin';
        admin.fullName = adminUser.fullName; // Also ensure fullName is updated if needed
        await admin.save();
        console.log('Updated existing admin user (admin@artsy.com) role to: admin');
      } else {
        console.log('Admin user (admin@artsy.com) already exists with role: admin');
      }
    }

    // Find or create/update TEST admin user (testadmin@artsy.com) (NEW)
    let testAdmin = await User.findOne({ email: testAdminUser.email });
    
    if (!testAdmin) {
      console.log('Test admin user (testadmin@artsy.com) not found, creating new one...');
      testAdmin = new User(testAdminUser);
      await testAdmin.save();
      console.log('Created new test admin user (testadmin@artsy.com) with role: admin');
    } else {
      if (testAdmin.role !== 'admin') {
        console.log('Test admin user (testadmin@artsy.com) found, but role is not admin. Updating role...');
        testAdmin.role = 'admin';
        testAdmin.fullName = testAdminUser.fullName; // Also ensure fullName is updated
        await testAdmin.save();
        console.log('Updated existing test admin user (testadmin@artsy.com) role to: admin');
      } else {
        console.log('Test admin user (testadmin@artsy.com) already exists with role: admin');
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nPrimary Admin credentials:');
    console.log('Email: admin@artsy.com');
    console.log('Password: admin123');
    console.log('\nTest Admin credentials:');
    console.log('Email: testadmin@artsy.com');
    console.log('Password: testadmin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 