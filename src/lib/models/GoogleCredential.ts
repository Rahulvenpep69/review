import mongoose, { Schema, Document } from "mongoose";

export interface IGoogleCredential extends Document {
  tenantId: string;
  brandId: string;
  accountId: string;
  locationId: string;
  tokens: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
    token_type: string;
    scope: string;
  };
  locationsCache: any[];
  lastSyncAt: Date;
  updatedAt: Date;
}

const GoogleCredentialSchema: Schema = new Schema({
  tenantId: { type: String, required: true, unique: true },
  brandId: { type: String, required: true },
  accountId: { type: String },
  locationId: { type: String },
  tokens: {
    access_token: { type: String, required: true },
    refresh_token: { type: String },
    expiry_date: { type: Number },
    token_type: { type: String },
    scope: { type: String },
  },
  locationsCache: { type: Array, default: [] },
  lastSyncAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.GoogleCredential || mongoose.model<IGoogleCredential>("GoogleCredential", GoogleCredentialSchema);
