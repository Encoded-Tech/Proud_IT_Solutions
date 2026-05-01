import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./config/env";



  export async function seedAdmin() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: "Proud Nepal",
        email: ADMIN_EMAIL,
        hashedPassword,
        phone: "9867174242",
        role: "admin",
        emailVerified: true,
        provider: "credentials",
      },
    },
    { upsert: true }
  );

  console.log("Admin seeded/updated successfully");
}
  
