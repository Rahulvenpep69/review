import mongoose, { Schema, Document } from "mongoose";

export interface IInteraction extends Document {
  tenantId: string;
  brandId: string;
  locationId: string;
  platform: "google" | "facebook" | "instagram" | "tiktok";
  externalId: string;
  customer: {
    name: string;
    username?: string;
    profileUrl?: string;
  };
  content: {
    text: string;
    rating?: number;
    mediaType: "text" | "image" | "video";
    sourceUrl?: string;
  };
  aiMetadata: {
    sentimentScore: number;
    sentimentLabel: "positive" | "negative" | "neutral" | "mixed";
    urgencyScore: number;
    intent: string;
    riskFlag: boolean;
    issueCategory?: string;
  };
  workflow: {
    approvalStatus: "pending" | "approved" | "rejected";
    postedStatus: "pending" | "posted" | "failed";
    assignedTo?: string;
  };
  isPost?: boolean;
  parentId?: string;
  replies: {
    aiSuggested?: string;
    actual?: string;
    postedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InteractionSchema: Schema = new Schema({
  tenantId: { type: String, required: true, index: true },
  brandId: { type: String, required: true, index: true },
  locationId: { type: String, required: true },
  platform: { type: String, enum: ["google", "facebook", "instagram", "tiktok"], required: true },
  externalId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    username: String,
    profileUrl: String,
  },
  content: {
    text: { type: String, required: true },
    rating: Number,
    mediaType: { type: String, enum: ["text", "image", "video"], default: "text" },
    sourceUrl: String,
  },
  aiMetadata: {
    sentimentScore: { type: Number, default: 0 },
    sentimentLabel: { type: String, enum: ["positive", "negative", "neutral", "mixed"], default: "neutral" },
    urgencyScore: { type: Number, default: 0 },
    intent: String,
    riskFlag: { type: Boolean, default: false },
    issueCategory: String,
  },
  workflow: {
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    postedStatus: { type: String, enum: ["pending", "posted", "failed"], default: "pending" },
    assignedTo: String,
  },
  isPost: { type: Boolean, default: false },
  parentId: { type: String, index: true },
  replies: {
    aiSuggested: String,
    actual: String,
    postedAt: Date,
  }
}, { timestamps: true });

export default mongoose.models.Interaction || mongoose.model<IInteraction>("Interaction", InteractionSchema);
