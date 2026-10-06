import mongoose from 'mongoose';
import config from '../config/index.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import logger from '../utils/logger.js';

const seedDatabase = async () => {
  try {
    await connectDatabase();

    let admin = await User.findOne({ email: 'admin@business.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@business.com',
        password: 'Admin@123456',
        role: 'admin',
        isActive: true
      });
      logger.info('Admin user created: admin@business.com');
    } else {
      logger.info('Admin user already exists');
    }

    const customerExists = await User.findOne({ email: 'customer@test.com' });
    if (!customerExists) {
      await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'Customer@123',
        role: 'customer',
        businessName: 'Test Business',
        phone: '9876543210',
        isActive: true
      });
      logger.info('Test customer created: customer@test.com');
    } else {
      logger.info('Test customer already exists');
    }

    // Seed Categories
    const categoriesData = [
      { name: 'Grains & Flours', description: 'Essential staple grains, rice and flours', sortOrder: 1 },
      { name: 'Oils & Ghee', description: 'Cooking oils, mustard oil, and pure ghee', sortOrder: 2 },
      { name: 'Dairy & Bakery', description: 'Fresh milk, butter, cheese and bakery items', sortOrder: 3 },
      { name: 'Beverages', description: 'Tea, coffee, juices and bottled drinks', sortOrder: 4 },
      { name: 'Snacks & Dry Fruits', description: 'Biscuits, chips, namkeen and premium dry fruits', sortOrder: 5 }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ name: cat.name });
      if (!existingCat) {
        existingCat = await Category.create({ ...cat, createdBy: admin._id, isActive: true });
        logger.info(`Category created: ${cat.name}`);
      }
      categoryMap[cat.name] = existingCat._id;
    }

    // Seed Products
    const productsData = [
      {
        name: 'Royal Basmati Rice',
        description: 'Long grain aromatic aged basmati rice for daily and special occasions.',
        category: categoryMap['Grains & Flours'],
        price: 140,
        unit: 'kg',
        minOrderQuantity: 5,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'],
        tags: ['rice', 'basmati', 'grains']
      },
      {
        name: 'Chakki Fresh Atta (Wheat Flour)',
        description: '100% whole wheat flour with natural dietary fiber.',
        category: categoryMap['Grains & Flours'],
        price: 45,
        unit: 'kg',
        minOrderQuantity: 10,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'],
        tags: ['flour', 'atta', 'wheat']
      },
      {
        name: 'Refined Sunflower Oil',
        description: 'Heart-healthy refined sunflower cooking oil with Vitamin A & D.',
        category: categoryMap['Oils & Ghee'],
        price: 135,
        unit: 'litre',
        minOrderQuantity: 2,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'],
        tags: ['oil', 'cooking', 'sunflower']
      },
      {
        name: 'Pure Desi Cow Ghee',
        description: 'Traditional aroma and golden granular texture desi cow ghee.',
        category: categoryMap['Oils & Ghee'],
        price: 650,
        unit: 'litre',
        minOrderQuantity: 1,
        images: ['https://images.unsplash.com/photo-1589927986086-3d10fb55d57c?w=500'],
        tags: ['ghee', 'dairy', 'pure']
      },
      {
        name: 'Pasteurized Full Cream Milk',
        description: 'Rich and creamy standardized cow & buffalo milk.',
        category: categoryMap['Dairy & Bakery'],
        price: 66,
        unit: 'litre',
        minOrderQuantity: 2,
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'],
        tags: ['milk', 'dairy', 'fresh']
      },
      {
        name: 'Salted Table Butter',
        description: 'Delicious creamy butter made from pure fresh cream.',
        category: categoryMap['Dairy & Bakery'],
        price: 58,
        unit: 'packet',
        minOrderQuantity: 2,
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500'],
        tags: ['butter', 'dairy', 'breakfast']
      },
      {
        name: 'Premium Assam Gold CTC Tea',
        description: 'Strong, rich aroma black tea leaves for an energizing cup.',
        category: categoryMap['Beverages'],
        price: 320,
        unit: 'packet',
        minOrderQuantity: 1,
        images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500'],
        tags: ['tea', 'beverage', 'chai']
      },
      {
        name: 'Natural Spring Mineral Water',
        description: 'Purified mineral-enriched drinking water bottle 1L.',
        category: categoryMap['Beverages'],
        price: 20,
        unit: 'piece',
        minOrderQuantity: 12,
        images: ['https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500'],
        tags: ['water', 'mineral', 'beverage']
      },
      {
        name: 'California Almonds (Badam)',
        description: 'Crunchy, sweet, and nutrient-dense raw almonds.',
        category: categoryMap['Snacks & Dry Fruits'],
        price: 420,
        unit: 'packet',
        minOrderQuantity: 1,
        images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500'],
        tags: ['almonds', 'dryfruits', 'healthy']
      },
      {
        name: 'Butter Crisp Cookies',
        description: 'Rich oven-baked butter cookies with light golden crust.',
        category: categoryMap['Snacks & Dry Fruits'],
        price: 40,
        unit: 'packet',
        minOrderQuantity: 3,
        images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500'],
        tags: ['cookies', 'snacks', 'biscuits']
      }
    ];

    for (const prod of productsData) {
      const existingProd = await Product.findOne({ name: prod.name });
      if (!existingProd) {
        await Product.create({
          ...prod,
          minOrderQuantity: 1,
          status: 'active',
          createdBy: admin._id
        });
        logger.info(`Product created: ${prod.name}`);
      }
    }

    // Ensure all existing products have minOrderQuantity: 1 for easy testing
    await Product.updateMany({}, { $set: { minOrderQuantity: 1 } });
    logger.info('Updated all products minOrderQuantity to 1');

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedDatabase();
