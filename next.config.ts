// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {

//  experimental: {
//   serverActions: {
//     bodySizeLimit: '10mb', // <- sets the limit
//     // allowedOrigins: ['https://example.com'], // optional
//   },
// },
  
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "images.unsplash.com",
//         port: "",
//       },
//       {
//         protocol: "https",
//         hostname: "plus.unsplash.com",
//         port: "",
//       },
//       {
//         protocol: "https",
//         hostname: "lacosmeticsnepal.s3.ap-south-1.amazonaws.com",
//         port: "",
//       },
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//       },
//       {
//     protocol: "https",
//     hostname: "lh3.googleusercontent.com",  
//   },
//     ],
//   },

  
// };

// export default nextConfig;

import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' data: blob: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https:; form-action 'self'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // 👇 Add these experimental options for better caching control
    optimizeCss: false, // Can sometimes cause issues with dynamic content
  },
  
  // 👇 Add headers configuration for cache control
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vary',
            value: '*',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  
  // 👇 Add this to ensure proper revalidation
  generateEtags: false, // Can help with Cloudflare issues
  
  // 👇 Add these compiler options
  compiler: {
    // Remove console logs in production for better performance
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // 👇 Important for server actions in production
  serverExternalPackages: ['mongoose'], // If you're using mongoose
  
  // 👇 Configure static page generation behavior
  staticPageGenerationTimeout: 3600,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lacosmeticsnepal.s3.ap-south-1.amazonaws.com",
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
    // 👇 Add these image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
  },
  
  // 👇 Add powered by header removal for security
  poweredByHeader: false,
  
  // 👇 Add trailing slash configuration
  trailingSlash: false,
  
  // 👇 Add React strict mode (might help with state issues)
  reactStrictMode: true,
};

export default nextConfig;
