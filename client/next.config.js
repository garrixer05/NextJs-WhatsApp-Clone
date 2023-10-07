/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:883389955,
    NEXT_PUBLIC_ZEGO_SERVER_ID:"ba7d452eb37de9f173c7e588fc5f0c6b"
  },
  images:{
    domains:["localhost"]
  }
};

module.exports = nextConfig;
