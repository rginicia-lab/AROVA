const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/user");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@arova.com";
    const password = "Admin@12345";

    let admin = await User.findOne({ email });

    if (admin) {
      admin.password = password;
      admin.role = "admin";
      admin.isActive = true;

      await admin.save();

      console.log("Admin account updated successfully.");
    } else {
      admin = await User.create({
        name: "AROVA Admin",
        email,
        password,
        role: "admin",
        isActive: true,
      });

      console.log("Admin account created successfully.");
    }

    console.log("Email:", email);
    console.log("Password:", password);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();