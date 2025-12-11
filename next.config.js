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
  // env:{
  //   AUTHORIZATION: process.env.AUTHORIZATION,
  //   API_KEY: process.env.API_KEY,
  // },
  images: {
    domains: ["www.netgear.com", "downloads1.netgear.com", "images.contentstack.io"],
  },

  experimental: { largePageDataBytes: 128 * 100000 },
};
module.exports =
  process.env.NODE_ENV === "development" ? config : withPWA(config);
