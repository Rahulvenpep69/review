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
  // Try /posts instead of /feed for better compatibility in dev mode
  const postsRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${pageId}/posts`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,message,created_time,permalink_url",
      limit: 25 // Increased depth
    }
  });

  const posts = postsRes.data.data || [];
  const allComments: any[] = [];

  for (const post of posts) {
    try {
      const commentsRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${post.id}/comments`, {
        params: {
          access_token: pageAccessToken,
          fields: "id,message,created_time", // Extremely minimal fields
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
    } catch (e) {
       console.error(`Error fetching comments for post ${post.id}`);
    }
  }

  return allComments;
};

export const fetchInstagramComments = async (instagramId: string, pageAccessToken: string) => {
  const mediaRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${instagramId}/media`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,caption,media_type,media_url,permalink,timestamp",
      limit: 25 // Increased depth
    }
  });

  const mediaList = mediaRes.data.data || [];
  const allComments: any[] = [];

  for (const media of mediaList) {
    try {
      const commentsRes = await axios.get(`https://graph.facebook.com/${API_VERSION}/${media.id}/comments`, {
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
    } catch (e) {
      console.error(`Error fetching comments for media ${media.id}`);
    }
  }

  return allComments;
};
