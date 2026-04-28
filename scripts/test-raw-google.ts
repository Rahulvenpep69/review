import dbConnect from "../src/lib/db";
import GoogleCredential from "../src/lib/models/GoogleCredential";
import axios from "axios";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-business`;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

async function testRawFetch() {
  await dbConnect();
  const credential = await GoogleCredential.findOne({});
  if (!credential) {
    console.log("No Google credentials found in DB.");
    process.exit(0);
  }

  oauth2Client.setCredentials(credential.tokens);
  try {
    const { token: activeToken } = await oauth2Client.getAccessToken();
    const bearerToken = activeToken || credential.tokens.access_token;

    console.log("Making request to Google Accounts API...");
    const accountRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    );
    console.log("Success! Real data accounts:", accountRes.data);
  } catch (err: any) {
    console.log("FAILED WITH ERROR:");
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log(err.message);
    }
  }
  process.exit(0);
}

testRawFetch();
