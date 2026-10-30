require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const Admin = require("./models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n===== ADMIN CREDENTIAL RESET =====\n");

    const oldUsername = await ask("Enter existing admin username: ");
    const newUsername = await ask("Enter new admin username: ");
    const newPassword = await ask("Enter new admin password: ");

    if (!newUsername.trim() || newPassword.length < 8) {
      throw new Error("Username is required and password must be at least 8 characters.");
    }

    const admin = await Admin.findOne({
      username: oldUsername.trim(),
    });

    if (!admin) {
      throw new Error("Existing admin account not found.");
    }

    const usernameExists = await Admin.findOne({
      username: newUsername.trim(),
      _id: { $ne: admin._id },
    });

    if (usernameExists) {
      throw new Error("This new username is already taken.");
    }

    admin.username = newUsername.trim();
    admin.password = await bcrypt.hash(newPassword, 12);

    await admin.save();

    console.log("\nAdmin credentials updated successfully!");
    console.log("You can now login using your new credentials.");

  } catch (error) {
    console.error("\nReset failed:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

resetAdmin();
