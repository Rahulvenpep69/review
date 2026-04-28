import axios from "axios";

const API_VERSION = "v17.0";

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
  // Use expanded field fetching to get comments in the same call as posts
  // This is much more permission-friendly
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/${pageId}/feed`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,message,created_time,permalink_url,comments{id,message,created_time}",
      limit: 25
    }
  });

  const posts = res.data.data || [];
  const allComments: any[] = [];

  for (const post of posts) {
    if (post.comments && post.comments.data) {
      allComments.push(...post.comments.data.map((c: any) => ({
        ...c,
        postId: post.id,
        postMessage: post.message,
        permalink: post.permalink_url,
        platform: "facebook"
      })));
    }
  }

  return allComments;
};

export const fetchInstagramComments = async (instagramId: string, pageAccessToken: string) => {
  // Use expanded field fetching for Instagram too
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/${instagramId}/media`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,caption,permalink,timestamp,comments{id,text,username,timestamp}",
      limit: 25
    }
  });

  const mediaList = res.data.data || [];
  const allComments: any[] = [];

  for (const media of mediaList) {
    if (media.comments && media.comments.data) {
      allComments.push(...media.comments.data.map((c: any) => ({
        ...c,
        mediaId: media.id,
        caption: media.caption,
        permalink: media.permalink,
        platform: "instagram"
      })));
    }
  }

  return allComments;
};
