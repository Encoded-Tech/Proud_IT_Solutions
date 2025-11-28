import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./config/env";

export async function seedAdmin() {
    const adminExists = await User.findOne({ role: "admin" });
  
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  
      await User.create({
        name: "Proud Nepal",
        email: ADMIN_EMAIL,
        hashedPassword,
        phone: "9800000000",
        role: "admin",
        emailVerified: true,
        provider: "credentials",
      });
  
      console.log("Admin seeded successfully");
    } else {
      console.log("✔ Admin already exists");
    }
  }
  
