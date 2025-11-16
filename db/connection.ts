import mongoose from "mongoose";
import { MONGODB_URI } from "@/config/env";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Proud Nepal Database Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export { connectDB };
