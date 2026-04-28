import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Interaction from "../src/lib/models/Interaction";

dotenv.config();

async function test() {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI?.split("@")[1]); // Log without credentials
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("✅ Database Connected.");
    
    const count = await Interaction.countDocuments();
    console.log("Current Interaction Count:", count);
    
    console.log("✅ Diagnostics Passed.");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Diagnostics Failed:", error.message);
    process.exit(1);
  }
}

test();
