import { SERVER_PRODUCTION_URL } from "@/config/env";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
          userAgent: '*',
          allow: ['/'],
          disallow: ['/admin/*']
        },
        sitemap: `${SERVER_PRODUCTION_URL}/sitemap.xml`,
        host: SERVER_PRODUCTION_URL
      }
      
}