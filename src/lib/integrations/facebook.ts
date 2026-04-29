import axios from "axios";

const API_VERSION = "v20.0";
const CONFIG_ID = "1920585538603976";

export const getFacebookAuthUrl = (appId: string, redirectUri: string) => {
  const scopes = [
    "public_profile",
    "email",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_metadata",
    "instagram_basic",
    "instagram_manage_comments",
    "business_management"
  ];

  return `https://www.facebook.com/${API_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&config_id=${CONFIG_ID}&response_type=code&auth_type=reauthenticate`;
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
  // Use v12.0 for Facebook specifically as it is more lenient with permissions for own pages
  const res = await axios.get(`https://graph.facebook.com/v12.0/${pageId}/posts`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,message,created_time,permalink_url,comments{id,message,created_time}",
      limit: 100
    }
  });

  const posts = res.data.data || [];
  const results: any[] = [];

  for (const post of posts) {
    // Save the post
    results.push({
      ...post,
      isPost: true
    });

    // Save comments
    if (post.comments && post.comments.data) {
      results.push(...post.comments.data.map((c: any) => ({
        ...c,
        permalink_url: post.permalink_url,
        isComment: true,
        parentId: post.id
      })));
    }
  }

  return results;
};

export const fetchInstagramComments = async (instagramId: string, pageAccessToken: string) => {
  const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/${instagramId}/media`, {
    params: {
      access_token: pageAccessToken,
      fields: "id,caption,permalink,timestamp,username,comments{id,text,username,timestamp}",
      limit: 100
    }
  });

  const mediaList = res.data.data || [];
  const results: any[] = [];

  for (const media of mediaList) {
    results.push({
      ...media,
      isPost: true
    });
    if (media.comments && media.comments.data) {
      results.push(...media.comments.data.map((c: any) => ({
        ...c,
        permalink: media.permalink,
        isComment: true,
        parentId: media.id
      })));
    }
  }

  return results;
};

export const initFacebookSdk = (appId: string) => {
  return new Promise((resolve) => {
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : API_VERSION
      });
      resolve(true);
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement; js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

export const loginWithFacebookSdk = (scopes: string[]) => {
  return new Promise((resolve, reject) => {
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject(new Error("User cancelled login or did not fully authorize."));
      }
    }, { config_id: CONFIG_ID, auth_type: 'reauthenticate' });
  });
};
