import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_app';
// Import models that may be used post-connection
import Product from './src/models/Product.js';
import Deal from './src/models/Deal.js';
import Category from './src/models/Category.js';
import Feedback from './src/models/Feedback.js';
mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  // Seed dummy data on first run
  try {
    // Seed categories first
    const categoryCount = await Category.countDocuments();
    let categories = {};
    if (categoryCount === 0) {
      const createdCategories = await Category.insertMany([
        { name: 'Fast Food', description: 'Quick bites and comfort food', icon: '🍔', displayOrder: 1 },
        { name: 'Dessert', description: 'Sweet treats and indulgent delights', icon: '🍰', displayOrder: 2 },
        { name: 'Vegan', description: 'Plant-based and cruelty-free options', icon: '🥗', displayOrder: 3 },
        { name: 'Drinks', description: 'Refreshing beverages and smoothies', icon: '🥤', displayOrder: 4 },
        { name: 'Soup', description: 'Warm and comforting soups', icon: '🍲', displayOrder: 5 },
        { name: 'Pizza', description: 'Wood-fired pizzas with authentic flavors', icon: '🍕', displayOrder: 6 },
        { name: 'Pasta', description: 'Fresh Italian pasta dishes', icon: '🍝', displayOrder: 7 },
        { name: 'Asian', description: 'Authentic Asian cuisine', icon: '🍜', displayOrder: 8 },
        { name: 'Seafood', description: 'Fresh catch from the ocean', icon: '🦐', displayOrder: 9 },
        { name: 'Breakfast', description: 'Start your day right', icon: '🍳', displayOrder: 10 },
        { name: 'Sandwiches', description: 'Delicious sandwiches and subs', icon: '🥪', displayOrder: 11 },
        { name: 'BBQ & Grill', description: 'Smoked and grilled perfection', icon: '🍖', displayOrder: 12 }
      ]);
      console.log('Seeded categories');
      
      // Map categories by name for easy reference
      createdCategories.forEach(cat => {
        categories[cat.name] = cat._id;
      });
    } else {
      // Load existing categories
      const existingCategories = await Category.find();
      existingCategories.forEach(cat => {
        categories[cat.name] = cat._id;
      });
    }
    
    // Seed products with categories
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        // Fast Food
        { 
          name: 'Classic Cheeseburger', 
          imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop', 
          price: 8.99, 
          description: 'Juicy beef patty with cheddar, lettuce, tomato, and house sauce.', 
          offerPercent: 10,
          categoryId: categories['Fast Food'],
          preparationTime: 15,
          tags: ['popular', 'bestseller'],
          allergens: ['gluten', 'dairy']
        },
        { 
          name: 'Crispy Chicken Burger', 
          imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=1200&auto=format&fit=crop', 
          price: 9.49, 
          description: 'Crispy fried chicken with mayo, pickles, and lettuce.', 
          offerPercent: 0,
          categoryId: categories['Fast Food'],
          preparationTime: 15,
          tags: ['crispy', 'popular'],
          allergens: ['gluten', 'eggs']
        },
        { 
          name: 'French Fries', 
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1200&auto=format&fit=crop', 
          price: 3.99, 
          description: 'Golden crispy fries with sea salt.', 
          offerPercent: 0,
          categoryId: categories['Fast Food'],
          preparationTime: 8,
          tags: ['side', 'crispy'],
          allergens: []
        },
        { 
          name: 'Chicken Nuggets', 
          imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1200&auto=format&fit=crop', 
          price: 6.99, 
          description: '10 pieces of crispy chicken nuggets with dipping sauce.', 
          offerPercent: 15,
          categoryId: categories['Fast Food'],
          preparationTime: 10,
          tags: ['kids favorite', 'crispy'],
          allergens: ['gluten']
        },
        
        // Dessert
        { 
          name: 'Chocolate Lava Cake', 
          imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1200&auto=format&fit=crop', 
          price: 6.99, 
          description: 'Warm chocolate cake with molten center, served with vanilla ice cream.', 
          offerPercent: 0,
          categoryId: categories['Dessert'],
          preparationTime: 12,
          tags: ['popular', 'indulgent'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'Cheesecake', 
          imageUrl: 'https://images.unsplash.com/photo-1533134242116-8dca0ec2c0f6?q=80&w=1200&auto=format&fit=crop', 
          price: 7.49, 
          description: 'Creamy New York style cheesecake with berry compote.', 
          offerPercent: 0,
          categoryId: categories['Dessert'],
          preparationTime: 5,
          tags: ['classic', 'creamy'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'Ice Cream Sundae', 
          imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200&auto=format&fit=crop', 
          price: 5.99, 
          description: 'Three scoops with chocolate sauce, whipped cream, and cherry.', 
          offerPercent: 10,
          categoryId: categories['Dessert'],
          preparationTime: 5,
          tags: ['cold', 'sweet'],
          allergens: ['dairy']
        },
        { 
          name: 'Tiramisu', 
          imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1200&auto=format&fit=crop', 
          price: 8.49, 
          description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.', 
          offerPercent: 0,
          categoryId: categories['Dessert'],
          preparationTime: 5,
          tags: ['italian', 'coffee'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        
        // Vegan
        { 
          name: 'Buddha Bowl', 
          imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop', 
          price: 11.99, 
          description: 'Quinoa, roasted vegetables, chickpeas, avocado, and tahini dressing.', 
          offerPercent: 0,
          categoryId: categories['Vegan'],
          preparationTime: 10,
          tags: ['vegan', 'healthy', 'gluten-free'],
          allergens: []
        },
        { 
          name: 'Vegan Burger', 
          imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1200&auto=format&fit=crop', 
          price: 10.99, 
          description: 'Plant-based patty with vegan cheese, lettuce, and tomato.', 
          offerPercent: 0,
          categoryId: categories['Vegan'],
          preparationTime: 15,
          tags: ['vegan', 'plant-based'],
          allergens: ['gluten', 'soy']
        },
        { 
          name: 'Falafel Wrap', 
          imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1200&auto=format&fit=crop', 
          price: 9.49, 
          description: 'Crispy falafel with hummus, tahini, and fresh vegetables.', 
          offerPercent: 0,
          categoryId: categories['Vegan'],
          preparationTime: 12,
          tags: ['vegan', 'mediterranean'],
          allergens: ['gluten']
        },
        
        // Drinks
        { 
          name: 'Mango Smoothie', 
          imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=1200&auto=format&fit=crop', 
          price: 5.99, 
          description: 'Fresh mango blended with yogurt, honey, and ice.', 
          offerPercent: 15,
          categoryId: categories['Drinks'],
          preparationTime: 5,
          tags: ['refreshing', 'popular'],
          allergens: ['dairy']
        },
        { 
          name: 'Fresh Orange Juice', 
          imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1200&auto=format&fit=crop', 
          price: 4.99, 
          description: 'Freshly squeezed orange juice.', 
          offerPercent: 0,
          categoryId: categories['Drinks'],
          preparationTime: 3,
          tags: ['fresh', 'healthy'],
          allergens: []
        },
        { 
          name: 'Iced Coffee', 
          imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=1200&auto=format&fit=crop', 
          price: 4.49, 
          description: 'Cold brew coffee with ice and milk.', 
          offerPercent: 0,
          categoryId: categories['Drinks'],
          preparationTime: 3,
          tags: ['cold', 'caffeine'],
          allergens: ['dairy']
        },
        { 
          name: 'Lemonade', 
          imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?q=80&w=1200&auto=format&fit=crop', 
          price: 3.99, 
          description: 'Homemade lemonade with fresh lemons and mint.', 
          offerPercent: 0,
          categoryId: categories['Drinks'],
          preparationTime: 3,
          tags: ['refreshing', 'citrus'],
          allergens: []
        },
        
        // Soup
        { 
          name: 'Tomato Basil Soup', 
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop', 
          price: 7.99, 
          description: 'Creamy tomato soup with fresh basil and a touch of cream.', 
          offerPercent: 0,
          categoryId: categories['Soup'],
          preparationTime: 8,
          tags: ['comfort food', 'warm'],
          allergens: ['dairy']
        },
        { 
          name: 'Chicken Noodle Soup', 
          imageUrl: 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?q=80&w=1200&auto=format&fit=crop', 
          price: 8.49, 
          description: 'Classic chicken soup with vegetables and egg noodles.', 
          offerPercent: 0,
          categoryId: categories['Soup'],
          preparationTime: 10,
          tags: ['comfort food', 'classic'],
          allergens: ['gluten', 'eggs']
        },
        { 
          name: 'Mushroom Soup', 
          imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop', 
          price: 8.99, 
          description: 'Creamy mushroom soup with herbs and garlic.', 
          offerPercent: 0,
          categoryId: categories['Soup'],
          preparationTime: 10,
          tags: ['creamy', 'vegetarian'],
          allergens: ['dairy']
        },
        
        // Pizza
        { 
          name: 'Margherita Pizza', 
          imageUrl: 'https://images.unsplash.com/photo-1548365328-9f547fb09530?q=80&w=1200&auto=format&fit=crop', 
          price: 12.99, 
          description: 'Tomato sauce, fresh mozzarella, basil, and olive oil.', 
          offerPercent: 0,
          categoryId: categories['Pizza'],
          preparationTime: 20,
          tags: ['vegetarian', 'classic'],
          allergens: ['gluten', 'dairy']
        },
        { 
          name: 'Pepperoni Pizza', 
          imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1200&auto=format&fit=crop', 
          price: 14.99, 
          description: 'Classic pepperoni with mozzarella and tomato sauce.', 
          offerPercent: 10,
          categoryId: categories['Pizza'],
          preparationTime: 20,
          tags: ['popular', 'meaty'],
          allergens: ['gluten', 'dairy']
        },
        { 
          name: 'BBQ Chicken Pizza', 
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop', 
          price: 15.99, 
          description: 'BBQ sauce, grilled chicken, red onions, and cilantro.', 
          offerPercent: 0,
          categoryId: categories['Pizza'],
          preparationTime: 22,
          tags: ['bbq', 'popular'],
          allergens: ['gluten', 'dairy']
        },
        
        // Pasta
        { 
          name: 'Spaghetti Carbonara', 
          imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1200&auto=format&fit=crop', 
          price: 13.99, 
          description: 'Creamy pasta with bacon, eggs, parmesan, and black pepper.', 
          offerPercent: 5,
          categoryId: categories['Pasta'],
          preparationTime: 15,
          tags: ['comfort food', 'italian'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'Penne Arrabbiata', 
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1200&auto=format&fit=crop', 
          price: 11.99, 
          description: 'Spicy tomato sauce with garlic and red chili flakes.', 
          offerPercent: 0,
          categoryId: categories['Pasta'],
          preparationTime: 15,
          tags: ['spicy', 'vegetarian'],
          allergens: ['gluten']
        },
        { 
          name: 'Fettuccine Alfredo', 
          imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=1200&auto=format&fit=crop', 
          price: 12.99, 
          description: 'Rich and creamy Alfredo sauce with parmesan.', 
          offerPercent: 0,
          categoryId: categories['Pasta'],
          preparationTime: 15,
          tags: ['creamy', 'classic'],
          allergens: ['gluten', 'dairy']
        },
        
        // Asian
        { 
          name: 'Pad Thai', 
          imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=1200&auto=format&fit=crop', 
          price: 14.99, 
          description: 'Stir-fried rice noodles with shrimp, peanuts, and tamarind sauce.', 
          offerPercent: 0,
          categoryId: categories['Asian'],
          preparationTime: 18,
          tags: ['spicy', 'authentic'],
          allergens: ['shellfish', 'peanuts', 'soy']
        },
        { 
          name: 'Chicken Fried Rice', 
          imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1200&auto=format&fit=crop', 
          price: 11.99, 
          description: 'Wok-fried rice with chicken, vegetables, and soy sauce.', 
          offerPercent: 0,
          categoryId: categories['Asian'],
          preparationTime: 15,
          tags: ['popular', 'filling'],
          allergens: ['soy', 'eggs']
        },
        { 
          name: 'Ramen Bowl', 
          imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1200&auto=format&fit=crop', 
          price: 13.99, 
          description: 'Japanese noodle soup with pork, egg, and vegetables.', 
          offerPercent: 0,
          categoryId: categories['Asian'],
          preparationTime: 20,
          tags: ['soup', 'japanese'],
          allergens: ['gluten', 'soy', 'eggs']
        },
        
        // Seafood
        { 
          name: 'Grilled Salmon', 
          imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=1200&auto=format&fit=crop', 
          price: 19.99, 
          description: 'Fresh Atlantic salmon with lemon butter and seasonal vegetables.', 
          offerPercent: 0,
          categoryId: categories['Seafood'],
          preparationTime: 20,
          tags: ['healthy', 'premium'],
          allergens: ['fish']
        },
        { 
          name: 'Fish & Chips', 
          imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=1200&auto=format&fit=crop', 
          price: 15.99, 
          description: 'Beer-battered cod with crispy fries and tartar sauce.', 
          offerPercent: 0,
          categoryId: categories['Seafood'],
          preparationTime: 18,
          tags: ['classic', 'crispy'],
          allergens: ['fish', 'gluten']
        },
        { 
          name: 'Shrimp Scampi', 
          imageUrl: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b7?q=80&w=1200&auto=format&fit=crop', 
          price: 17.99, 
          description: 'Garlic butter shrimp with white wine and herbs.', 
          offerPercent: 0,
          categoryId: categories['Seafood'],
          preparationTime: 15,
          tags: ['gourmet', 'garlic'],
          allergens: ['shellfish', 'dairy']
        },
        
        // Breakfast
        { 
          name: 'Pancake Stack', 
          imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1200&auto=format&fit=crop', 
          price: 9.99, 
          description: 'Fluffy pancakes with maple syrup, butter, and fresh berries.', 
          offerPercent: 10,
          categoryId: categories['Breakfast'],
          preparationTime: 12,
          tags: ['sweet', 'morning'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'Eggs Benedict', 
          imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=1200&auto=format&fit=crop', 
          price: 12.99, 
          description: 'Poached eggs on English muffin with hollandaise sauce and bacon.', 
          offerPercent: 0,
          categoryId: categories['Breakfast'],
          preparationTime: 15,
          tags: ['classic', 'savory'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'French Toast', 
          imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1200&auto=format&fit=crop', 
          price: 10.49, 
          description: 'Thick-cut brioche with cinnamon, powdered sugar, and syrup.', 
          offerPercent: 0,
          categoryId: categories['Breakfast'],
          preparationTime: 12,
          tags: ['sweet', 'popular'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        { 
          name: 'Breakfast Burrito', 
          imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=1200&auto=format&fit=crop', 
          price: 11.99, 
          description: 'Scrambled eggs, bacon, cheese, and salsa in a flour tortilla.', 
          offerPercent: 0,
          categoryId: categories['Breakfast'],
          preparationTime: 10,
          tags: ['savory', 'filling'],
          allergens: ['gluten', 'dairy', 'eggs']
        },
        
        // Sandwiches
        { 
          name: 'Club Sandwich', 
          imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1200&auto=format&fit=crop', 
          price: 10.99, 
          description: 'Triple-decker with turkey, bacon, lettuce, tomato, and mayo.', 
          offerPercent: 0,
          categoryId: categories['Sandwiches'],
          preparationTime: 10,
          tags: ['classic', 'filling'],
          allergens: ['gluten', 'eggs']
        },
        { 
          name: 'BLT Sandwich', 
          imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1200&auto=format&fit=crop', 
          price: 8.99, 
          description: 'Crispy bacon, lettuce, tomato, and mayo on toasted bread.', 
          offerPercent: 0,
          categoryId: categories['Sandwiches'],
          preparationTime: 8,
          tags: ['classic', 'simple'],
          allergens: ['gluten', 'eggs']
        },
        { 
          name: 'Philly Cheesesteak', 
          imageUrl: 'https://images.unsplash.com/photo-1619894991209-e2fd0a35e6c5?q=80&w=1200&auto=format&fit=crop', 
          price: 13.99, 
          description: 'Thinly sliced beef with melted cheese, onions, and peppers.', 
          offerPercent: 0,
          categoryId: categories['Sandwiches'],
          preparationTime: 15,
          tags: ['meaty', 'cheesy'],
          allergens: ['gluten', 'dairy']
        },
        
        // BBQ & Grill
        { 
          name: 'BBQ Ribs', 
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', 
          price: 18.99, 
          description: 'Slow-cooked pork ribs with smoky BBQ sauce and coleslaw.', 
          offerPercent: 0,
          categoryId: categories['BBQ & Grill'],
          preparationTime: 25,
          tags: ['smoky', 'tender'],
          allergens: []
        },
        { 
          name: 'Grilled Chicken Wings', 
          imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=1200&auto=format&fit=crop', 
          price: 12.99, 
          description: 'Spicy grilled wings with ranch dressing.', 
          offerPercent: 15,
          categoryId: categories['BBQ & Grill'],
          preparationTime: 20,
          tags: ['spicy', 'popular'],
          allergens: ['dairy']
        },
        { 
          name: 'Beef Brisket', 
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop', 
          price: 21.99, 
          description: 'Slow-smoked beef brisket with BBQ sauce and pickles.', 
          offerPercent: 0,
          categoryId: categories['BBQ & Grill'],
          preparationTime: 30,
          tags: ['premium', 'smoky'],
          allergens: []
        }
      ]);
      console.log('Seeded dummy products with categories');
    }

    // Seed deals
    const dealCount = await Deal.countDocuments();
    if (dealCount === 0) {
      await Deal.insertMany([
        {
          title: '🎉 10% Off Next Order',
          description: 'Get 10% off your next order. Valid for 30 days.',
          pointsCost: 50,
          discountType: 'percentage',
          discountValue: 10,
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 10,
          maxUses: 3
        },
        {
          title: '💰 $5 Off',
          description: 'Save $5 on orders over $20. Redeem and enjoy!',
          pointsCost: 100,
          discountType: 'fixed',
          discountValue: 5,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 20,
          maxUses: 2
        },
        {
          title: '🍕 Free Pizza Upgrade',
          description: 'Upgrade any pizza to large size for free!',
          pointsCost: 150,
          discountType: 'percentage',
          discountValue: 20,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 15,
          maxUses: 1
        },
        {
          title: '🌟 25% Off Premium Items',
          description: 'Get 25% off on all premium menu items.',
          pointsCost: 200,
          discountType: 'percentage',
          discountValue: 25,
          imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 25,
          maxUses: 1
        },
        {
          title: '🎁 Free Dessert',
          description: 'Get a free dessert with any order over $15.',
          pointsCost: 75,
          discountType: 'freeItem',
          discountValue: 5,
          imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 15,
          maxUses: 2
        },
        {
          title: '🔥 $10 Off Big Orders',
          description: 'Save $10 on orders over $50. Perfect for parties!',
          pointsCost: 250,
          discountType: 'fixed',
          discountValue: 10,
          imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=400&auto=format&fit=crop',
          minOrderValue: 50,
          maxUses: 1
        }
      ]);
      console.log('Seeded dummy deals');
    }
  } catch (e) {
    console.error('Seeding error:', e);
  }
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
import authRoutes from './src/routes/auth.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import analyticsRoutes from './src/routes/analytics.js';
import offerRoutes from './src/routes/offer.js';
import paymentRoutes from './src/routes/payment.js';
import configRoutes from './src/routes/config.js';
import dealRoutes from './src/routes/deals.js';
import categoryRoutes from './src/routes/categories.js';
import settingsRoutes from './src/routes/settings.js';
import feedbackRoutes from './src/routes/feedback.js';
import uploadRoutes from './src/routes/upload.js';
import deliveryPlatformsRoutes from './src/routes/delivery-platforms.js';
import masterRoutes from './src/routes/master.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/delivery-platforms', deliveryPlatformsRoutes);
app.use('/api/master', masterRoutes);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for simple routing across pages in /public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


