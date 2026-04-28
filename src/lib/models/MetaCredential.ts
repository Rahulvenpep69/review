import mongoose, { Schema, Document } from "mongoose";

export interface IMetaCredential extends Document {
  tenantId: string;
  brandId: string;
  accessToken: string;
  pages: Array<{
    id: string;
    name: string;
    accessToken: string;
    instagramId?: string;
  }>;
  selectedPageId?: string;
  selectedInstagramId?: string;
  lastSyncAt: Date;
  updatedAt: Date;
}

const MetaCredentialSchema: Schema = new Schema({
  tenantId: { type: String, required: true, unique: true },
  brandId: { type: String, required: true },
  accessToken: { type: String, required: true }, // Long-lived User Access Token
  pages: [{
    id: { type: String },
    name: { type: String },
    accessToken: { type: String },
    instagramId: { type: String }
  }],
  selectedPageId: { type: String },
  selectedInstagramId: { type: String },
  lastSyncAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.MetaCredential || mongoose.model<IMetaCredential>("MetaCredential", MetaCredentialSchema);
