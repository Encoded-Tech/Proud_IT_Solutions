import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
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
