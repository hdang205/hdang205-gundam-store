import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Product from "./models/Product.js";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Seed Admin
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Admin System",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(
        "Admin account created in MongoDB: admin@gmail.com / admin123",
      );
    } else {
      console.log("Admin account already exists in MongoDB.");
    }

    // Seed Staff
    const staffAccounts = [
      { name: "Nguyễn Văn Kho", email: "staff.kho@gmail.com", password: "staff123", phoneNumber: "0901111111" },
      { name: "Trần Thị Tư Vấn", email: "staff.tuvan@gmail.com", password: "staff123", phoneNumber: "0902222222" },
      { name: "Lê Văn CSKH", email: "staff.cskh@gmail.com", password: "staff123", phoneNumber: "0903333333" },
    ];

    for (const staffData of staffAccounts) {
      const exists = await User.findOne({ email: staffData.email });
      if (!exists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(staffData.password, salt);
        await User.create({
          name: staffData.name,
          email: staffData.email,
          password: hashedPassword,
          role: "staff",
          phoneNumber: staffData.phoneNumber,
        });
        console.log(`Staff account created: ${staffData.email} / ${staffData.password}`);
      } else {
        console.log(`Staff account already exists: ${staffData.email}`);
      }
    }

    // Seed Products from js/products.json
    const productsPath = path.join(__dirname, "..", "js", "products.json");
    const productsRaw = await fs.readFile(productsPath, "utf-8");
    const productsJson = JSON.parse(productsRaw);

    const existingProductsCount = await Product.countDocuments();
    if (existingProductsCount === 0) {
      const productsToSeed = productsJson.map((p) => {
        // Handle stock string to number conversion
        let stockNum = 50; // Default
        if (p.stock === "Hết hàng") stockNum = 0;
        else if (p.stock === "Sắp hết") stockNum = 5;
        else if (typeof p.stock === "number") stockNum = p.stock;

        return {
          ...p,
          _id: undefined, // Let MongoDB generate new IDs or use fixed ones if needed
          stock: stockNum,
        };
      });

      await Product.insertMany(productsToSeed);
      console.log(
        `Seeded ${productsToSeed.length} products from js/products.json`,
      );
    } else {
      console.log(`Database already has ${existingProductsCount} products.`);
    }

    await mongoose.disconnect();
    console.log("Seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
