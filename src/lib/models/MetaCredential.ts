import mongoose, { Schema, Document } from "mongoose";

export interface IMetaCredential extends Document {
  tenantId: string;
  brandId: string;
  accessToken: string; // User Access Token
  facebookUserToken?: string;
  facebookPages?: Array<{
    id: string;
    name: string;
    accessToken: string;
    instagramId?: string;
  }>;
  facebookPageId?: string;
  facebookPageName?: string;
  facebookPageToken?: string;
  facebookConnected?: boolean;
  connectedAt?: Date;
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
  facebookUserToken: { type: String },
  facebookPages: [{
    id: { type: String },
    name: { type: String },
    accessToken: { type: String },
    instagramId: { type: String }
  }],
  facebookPageId: { type: String },
  facebookPageName: { type: String },
  facebookPageToken: { type: String },
  facebookConnected: { type: Boolean, default: false },
  connectedAt: { type: Date, default: Date.now },
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
