require("dotenv").config();

const mongoose = require("mongoose");

const Category = require("./models/Category");
const Product = require("./models/Product");

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");

    // =========================
    // CATEGORIES
    // =========================

    const laptopCategory = await Category.findOneAndUpdate(
      { slug: "laptops" },
      {
        name: "Laptops",
        slug: "laptops",
        description: "Powerful laptops for work, study and everyday use.",
        image: "",
        isActive: true,
      },
      { new: true, upsert: true }
    );

    const mobileCategory = await Category.findOneAndUpdate(
      { slug: "mobile-phones" },
      {
        name: "Mobile Phones",
        slug: "mobile-phones",
        description: "Modern smartphones with powerful features.",
        image: "",
        isActive: true,
      },
      { new: true, upsert: true }
    );

    // =========================
    // PRODUCTS
    // =========================

    const products = [
      {
        name: "Apple MacBook Air M2",
        slug: "apple-macbook-air-m2",
        description:
          "A lightweight and powerful laptop featuring the Apple M2 chip, Retina display and long battery life.",
        category: laptopCategory._id,
        brand: "Apple",
        price: 89990,
        originalPrice: 99990,
        stock: 15,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1517336714739-489689fd1ca8"
        ],
        tags: ["laptop", "apple", "macbook", "m2"],
        specifications: {
          Processor: "Apple M2",
          RAM: "8 GB",
          Storage: "256 GB SSD",
          Display: "13.6 inch",
          OperatingSystem: "macOS",
        },
        isActive: true,
      },

      {
        name: "Dell Inspiron 15",
        slug: "dell-inspiron-15",
        description:
          "A reliable everyday laptop suitable for students, professionals and general productivity.",
        category: laptopCategory._id,
        brand: "Dell",
        price: 62990,
        originalPrice: 69990,
        stock: 20,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
        ],
        tags: ["laptop", "dell", "inspiron", "student"],
        specifications: {
          Processor: "Intel Core i5",
          RAM: "16 GB",
          Storage: "512 GB SSD",
          Display: "15.6 inch",
          OperatingSystem: "Windows 11",
        },
        isActive: true,
      },

      {
        name: "HP Pavilion 14",
        slug: "hp-pavilion-14",
        description:
          "A stylish and versatile laptop designed for everyday work, study and entertainment.",
        category: laptopCategory._id,
        brand: "HP",
        price: 57990,
        originalPrice: 64990,
        stock: 18,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
        ],
        tags: ["laptop", "hp", "pavilion"],
        specifications: {
          Processor: "Intel Core i5",
          RAM: "16 GB",
          Storage: "512 GB SSD",
          Display: "14 inch",
          OperatingSystem: "Windows 11",
        },
        isActive: true,
      },

      {
        name: "Apple iPhone 15",
        slug: "apple-iphone-15",
        description:
          "A premium smartphone with a powerful processor, advanced camera system and vibrant display.",
        category: mobileCategory._id,
        brand: "Apple",
        price: 69990,
        originalPrice: 79990,
        stock: 25,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd"
        ],
        tags: ["mobile", "iphone", "apple", "smartphone"],
        specifications: {
          Display: "6.1 inch",
          Storage: "128 GB",
          Camera: "48 MP",
          Battery: "All-day battery",
          OperatingSystem: "iOS",
        },
        isActive: true,
      },

      {
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        description:
          "A flagship Android smartphone with a premium design, powerful performance and advanced cameras.",
        category: mobileCategory._id,
        brand: "Samsung",
        price: 64999,
        originalPrice: 74999,
        stock: 22,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c"
        ],
        tags: ["mobile", "samsung", "galaxy", "android"],
        specifications: {
          Display: "6.2 inch",
          Storage: "256 GB",
          RAM: "8 GB",
          Camera: "50 MP",
          OperatingSystem: "Android",
        },
        isActive: true,
      },

      {
        name: "OnePlus 12",
        slug: "oneplus-12",
        description:
          "A high-performance smartphone featuring a smooth display, powerful processor and fast charging.",
        category: mobileCategory._id,
        brand: "OnePlus",
        price: 59999,
        originalPrice: 64999,
        stock: 20,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97"
        ],
        tags: ["mobile", "oneplus", "android", "smartphone"],
        specifications: {
          Display: "6.82 inch",
          Storage: "256 GB",
          RAM: "12 GB",
          Camera: "50 MP",
          OperatingSystem: "Android",
        },
        isActive: true,
      },

      {
        name: "Google Pixel 8",
        slug: "google-pixel-8",
        description:
          "A smart and compact smartphone with Google's advanced camera technology and clean Android experience.",
        category: mobileCategory._id,
        brand: "Google",
        price: 54999,
        originalPrice: 59999,
        stock: 16,
        lowStockThreshold: 5,
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97"
        ],
        tags: ["mobile", "google", "pixel", "android"],
        specifications: {
          Display: "6.2 inch",
          Storage: "128 GB",
          RAM: "8 GB",
          Camera: "50 MP",
          OperatingSystem: "Android",
        },
        isActive: true,
      },
    ];

    for (const product of products) {
      await Product.findOneAndUpdate(
        { slug: product.slug },
        product,
        { new: true, upsert: true }
      );
    }

    console.log("Categories created/updated ✅");
    console.log("8 products created/updated ✅");

    await mongoose.disconnect();

    console.log("Seed completed successfully 🎉");
  } catch (error) {
    console.error("Seed failed ❌");
    console.error(error.message);

    process.exit(1);
  }
};

seedProducts();