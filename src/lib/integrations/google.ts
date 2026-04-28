import { google } from "googleapis";
import axios from "axios";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google-business`;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export const getGoogleAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/business.manage"
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent"
  });
};

export const exchangeCodeForTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

export const fetchGoogleBusinessData = async (tokens: any, preferredAccountId?: string, preferredLocationId?: string) => {
  oauth2Client.setCredentials(tokens);

  try {
    // Ensure we have a valid access token (refreshes automatically if expired)
    const { token: activeToken } = await oauth2Client.getAccessToken();
    const bearerToken = activeToken || tokens.access_token;

    let accountId = preferredAccountId;
    let locationId = preferredLocationId;

    // STEP A: Get Accounts (only if accountId not provided)
    if (!accountId) {
      const accountRes = await axios.get(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        { headers: { Authorization: `Bearer ${bearerToken}` } }
      );
      
      const accounts = accountRes.data.accounts || [];
      if (accounts.length === 0) return [];
      accountId = accounts[0].name; 
    }

    // STEP B: Get Locations (only if locationId not provided)
    if (!locationId) {
      const locationRes = await axios.get(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`,
        { 
          headers: { Authorization: `Bearer ${bearerToken}` },
          params: { readMask: "name,title" }
        }
      );

      const locations = locationRes.data.locations || [];
      if (locations.length === 0) return [];
      locationId = locations[0].name;
    }


    // STEP C: Fetch Reviews
    // Note: V4 API used for reviews as it's the most stable for this specific endpoint
    const reviewsRes = await axios.get(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    );

    const rawReviews = reviewsRes.data.reviews || [];

    // Normalize Data
    console.log(`Successfully fetched ${rawReviews.length} reviews from Google.`);
    return rawReviews.map((review: any) => ({
      platform: "google",
      accountId: accountId,
      locationId: locationId,
      reviewId: review.reviewId,
      reviewerName: review.reviewer.displayName,
      reviewerPhoto: review.reviewer.profilePhotoUrl,
      rating: review.starRating,
      comment: review.comment,
      createdAt: review.createTime,
      updatedAt: review.updateTime,
      existingReply: review.reviewReply?.comment || "",
      replyUpdatedAt: review.reviewReply?.updateTime || "",
      sentiment: "pending",
      aiSuggestedReply: "",
      status: "pending"
    }));

  } catch (error: any) {
    console.error("CRITICAL GOOGLE SYNC ERROR:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
    throw error;
  }
};


export const listGoogleLocations = async (tokens: any) => {
  oauth2Client.setCredentials(tokens);

  try {
    const { token: activeToken } = await oauth2Client.getAccessToken();
    const bearerToken = activeToken || tokens.access_token;

    // 1. Get Accounts
    const accountRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    );
    
    const accounts = accountRes.data.accounts || [];
    const allLocations = [];

    // 2. Get Locations for each account
    for (const account of accounts) {
      try {
        const locationRes = await axios.get(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
          { 
            headers: { Authorization: `Bearer ${bearerToken}` },
            params: { readMask: "name,title" }
          }
        );
        const locations = locationRes.data.locations || [];
        allLocations.push(...locations.map((l: any) => ({
          accountId: account.name,
          accountName: account.accountName,
          locationId: l.name,
          locationName: l.title
        })));
      } catch (locErr) {
        console.warn(`Could not fetch locations for account ${account.name}`);
      }
    }

    return allLocations;

  } catch (error: any) {
    console.error("Error listing Google locations:", error.message);
    throw error;
  }
};


