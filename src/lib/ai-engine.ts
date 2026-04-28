import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIAnalysisResult {
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  urgency: number; // 1-10
  intent: string;
  category: string;
  suggestedReply: string;
  riskFlag: boolean;
}

export async function analyzeInteraction(
  text: string, 
  platform: string, 
  brandTone: string = "Professional",
  rating?: number
): Promise<AIAnalysisResult> {
  const prompt = `
    Analyze this customer interaction and provide a structured JSON response.
    
    Platform: ${platform}
    Rating: ${rating || "N/A"}
    Brand Tone: ${brandTone}
    Customer Comment: "${text}"

    Tasks:
    1. Detect sentiment (positive, negative, neutral, mixed).
    2. Detect urgency (1-10 score).
    3. Detect intent (Complaint, Praise, Inquiry, Refund request, etc.).
    4. Detect issue category (Service, Product, Delivery, Pricing, etc.).
    5. Detect crisis/legal risk (true/false).
    6. Generate a brand-safe public response in the specified tone. Keep within platform character limits.

    Return ONLY a JSON object with these keys: 
    "sentiment", "urgency", "intent", "category", "suggestedReply", "riskFlag"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      sentiment: "neutral",
      urgency: 5,
      intent: "General",
      category: "Uncategorized",
      suggestedReply: "Thank you for your feedback. We are looking into this.",
      riskFlag: false
    };
  }
}
