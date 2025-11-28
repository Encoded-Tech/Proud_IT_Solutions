import mongoose from "mongoose";
import { MONGODB_URI } from "@/config/env";
import { seedAdmin } from "@/adminSeeder";

let isConnected = false;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI);

    isConnected = true;
    console.log("Proud Nepal Database Connected");
    await seedAdmin();

  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    throw error;
  }
};
