import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformConfig extends Document {
  tenantId: string;
  metaAppId?: string;
  metaAppSecret?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  updatedAt: Date;
}

const PlatformConfigSchema: Schema = new Schema({
  tenantId: { type: String, required: true, unique: true },
  metaAppId: { type: String },
  metaAppSecret: { type: String },
  googleClientId: { type: String },
  googleClientSecret: { type: String },
}, { timestamps: true });

export default mongoose.models.PlatformConfig || mongoose.model<IPlatformConfig>("PlatformConfig", PlatformConfigSchema);
