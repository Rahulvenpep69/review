import axios from "axios";

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

  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes.join(",")}&response_type=code`;
};

export const exchangeCodeForFacebookToken = async (code: string, appId: string, appSecret: string, redirectUri: string) => {
  // 1. Exchange code for short-lived token
  const tokenRes = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
    params: {
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code
    }
  });

  const shortToken = tokenRes.data.access_token;

  // 2. Exchange for long-lived token (60 days)
  const longTokenRes = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
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
  const res = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
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
  // 1. Get latest posts
  const postsRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,message,created_time,permalink_url",
      limit: 10
    }
  });

  const posts = postsRes.data.data || [];
  const allComments: any[] = [];

  // 2. For each post, get comments
  for (const post of posts) {
    const commentsRes = await axios.get(`https://graph.facebook.com/v19.0/${post.id}/comments`, {
      params: {
        access_token: pageAccessToken,
        fields: "id,message,from,created_time,user_likes",
        limit: 50
      }
    });

    const comments = commentsRes.data.data || [];
    allComments.push(...comments.map((c: any) => ({
      ...c,
      postId: post.id,
      postMessage: post.message,
      permalink: post.permalink_url,
      platform: "facebook"
    })));
  }

  return allComments;
};

export const fetchInstagramComments = async (instagramId: string, pageAccessToken: string) => {
  // 1. Get latest media
  const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${instagramId}/media`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,caption,media_type,media_url,permalink,timestamp",
      limit: 10
    }
  });

  const mediaList = mediaRes.data.data || [];
  const allComments: any[] = [];

  // 2. For each media, get comments
  for (const media of mediaList) {
    const commentsRes = await axios.get(`https://graph.facebook.com/v19.0/${media.id}/comments`, {
      params: {
        access_token: pageAccessToken,
        fields: "id,text,username,timestamp",
        limit: 50
      }
    });

    const comments = commentsRes.data.data || [];
    allComments.push(...comments.map((c: any) => ({
      ...c,
      mediaId: media.id,
      caption: media.caption,
      permalink: media.permalink,
      platform: "instagram"
    })));
  }

  return allComments;
};
