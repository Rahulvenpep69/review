import axios from "axios";

const API_VERSION = "v16.0";

export const getFacebookAuthUrl = (appId: string, redirectUri: string) => {
  const scopes = [
    "public_profile",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "instagram_basic",
    "instagram_manage_comments",
    "business_management"
  ];

  return `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes.join(",")}&response_type=code`;
};

export const exchangeCodeForFacebookToken = async (code: string, appId: string, appSecret: string, redirectUri: string) => {
  const tokenRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`, {
    params: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code
    }
  });

  const shortToken = tokenRes.data.access_token;

  const longTokenRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken
    }
  });

  return longTokenRes.data.access_token;
};

export const fetchFacebookPages = async (userAccessToken: string) => {
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/me/accounts`, {
    params: {
      access_token: userAccessToken,
      fields: "id,name,access_token,instagram_business_account"
    }
  });

  return res.data.data.map((page: any) => ({
    id: page.id,
    name: page.name,
    accessToken: page.access_token,
    instagramId: page.instagram_business_account?.id
  }));
};

export const fetchFacebookComments = async (pageId: string, pageAccessToken: string) => {
  // THE IDENTITY TRICK:
  // Using "/me/feed" with a Page Access Token acts as the Page itself.
  // This often bypasses the #10 Permission error for admins.
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/me/feed`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,message,created_time,permalink_url,comments{id,message,created_time,from}",
      limit: 100
    }
  });

  const posts = res.data.data || [];
  const results: any[] = [];

  for (const post of posts) {
    results.push(post);
    if (post.comments && post.comments.data) {
      results.push(...post.comments.data.map((c: any) => ({
        ...c,
        permalink_url: post.permalink_url,
        isComment: true
      })));
    }
  }

  return results;
};

export const fetchInstagramComments = async (instagramId: string, pageAccessToken: string) => {
  // For Instagram, we must use the ID, but we use the Page Token
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/${instagramId}/media`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,caption,permalink,timestamp,comments{id,text,username,timestamp}",
      limit: 100
    }
  });

  const mediaList = res.data.data || [];
  const results: any[] = [];

  for (const media of mediaList) {
    results.push(media);
    if (media.comments && media.comments.data) {
      results.push(...media.comments.data.map((c: any) => ({
        ...c,
        permalink: media.permalink,
        isComment: true
      })));
    }
  }

  return results;
};
