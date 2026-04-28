import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Interaction from "../src/lib/models/Interaction";
import GoogleCredential from "../src/lib/models/GoogleCredential";

dotenv.config();

async function clear() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB.");
    
    await Interaction.deleteMany({});
    console.log("Cleared Interactions.");
    
    await GoogleCredential.deleteMany({});
    console.log("Cleared Google Credentials.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

clear();
