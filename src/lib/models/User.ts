import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ["Super Admin", "Moderator", "Agent"], 
    default: "Agent" 
  },
  status: { 
    type: String, 
    enum: ["Active", "Away", "Inactive"], 
    default: "Active" 
  },
  tenantId: { type: String, required: true, default: "tenant_1" },
  brandId: { type: String },
  lastActive: { type: Date, default: Date.now },
  repliesCount: { type: Number, default: 0 },
  avgResponseTime: { type: String, default: "0 hrs" }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
