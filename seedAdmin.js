import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Delete existing admin
    await User.deleteOne({ email: "admin@mylogin.com" });
    console.log("Old admin deleted");

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@mylogin.com",
      password: "admin123", // This will be hashed by the pre-save hook
      isAdmin: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
    console.log("\nYou can now login as admin with these credentials.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
