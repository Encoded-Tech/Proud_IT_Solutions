import mongoose from "mongoose";
import { MONGODB_URI } from "@/config/env";

const connectDB = async () => {
    // let's check mongodb connected  cha ki nai
    if(mongoose.connection.readyState >=1) return;
    try {
        console.log("Mongo URI:", MONGODB_URI);

        await mongoose.connect(MONGODB_URI);
        console.log("Proud Nepal Database Connected");
    } catch (error) {
        console.error("Error Occured While Connecting to the Database", error);
    }
}
export default connectDB;