const withPWA = require("next-pwa")({
  dest: "public",
});

const config = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent fs module from being bundled client-side
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
  env:{
    AUTHORIZATION: process.env.AUTHORIZATION,
    API_KEY: process.env.API_KEY,
  },
  images: {
    domains: ["www.netgear.com", "downloads1.netgear.com", "images.contentstack.io"],
  },

  publicRuntimeConfig: {
    // Will be available on both server and client
    CONTENTSTACK_API_KEY: process.env.CONTENTSTACK_API_KEY,
    CONTENTSTACK_DELIVERY_TOKEN: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    CONTENTSTACK_BRANCH: process.env.CONTENTSTACK_BRANCH || "main",
    CONTENTSTACK_REGION: process.env.CONTENTSTACK_REGION || "us",
    CONTENTSTACK_ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT,
    CONTENTSTACK_PREVIEW_TOKEN: process.env.CONTENTSTACK_PREVIEW_TOKEN,
    CONTENTSTACK_PREVIEW_HOST:
    process.env.CONTENTSTACK_PREVIEW_HOST || "rest-preview.contentstack.com",
    CONTENTSTACK_API_HOST:
    process.env.CONTENTSTACK_API_HOST || "api.contentstack.io",
    CONTENTSTACK_APP_HOST:
    process.env.CONTENTSTACK_APP_HOST || "app.contentstack.com",
    CONTENTSTACK_LIVE_PREVIEW: process.env.CONTENTSTACK_LIVE_PREVIEW || "true",
    CONTENTSTACK_LIVE_EDIT_TAGS:
    process.env.CONTENTSTACK_LIVE_EDIT_TAGS || "false",
    NEXT_PUBLIC_CONTENT_KEY: process.env.NEXT_PUBLIC_CONTENT_KEY,
    NEXT_PUBLIC_ACCESS_TOKEN: process.env.NEXT_PUBLIC_ACCESS_TOKEN,
    HEADER_API_KEY: process.env.HEADER_API_KEY,
    HEADER_ACCESS_TOKEN: process.env.HEADER_ACCESS_TOKEN,
    
  },
  experimental: { largePageDataBytes: 128 * 100000 },
};
module.exports =
  process.env.NODE_ENV === "development" ? config : withPWA(config);
