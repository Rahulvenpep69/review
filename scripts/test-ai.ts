import * as dotenv from "dotenv";
import { analyzeInteraction } from "../src/lib/ai-engine";

dotenv.config();

async function testAI() {
  console.log("Testing AI Engine...");
  const result = await analyzeInteraction(
    "The food was great but the waiter was rude.",
    "google",
    "Professional",
    4
  );
  console.log("AI Result:", JSON.stringify(result, null, 2));
}

testAI();
