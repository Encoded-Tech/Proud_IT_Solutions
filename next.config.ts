import type { NextConfig } from "next";

const nextConfig: NextConfig = {

 experimental: {
  serverActions: {
    bodySizeLimit: '10mb', // <- sets the limit
    // allowedOrigins: ['https://example.com'], // optional
  },
},
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lacosmeticsnepal.s3.ap-south-1.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",  
  },
    ],
  },

  
};

export default nextConfig;
