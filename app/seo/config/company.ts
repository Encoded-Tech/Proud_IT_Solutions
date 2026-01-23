import { APP_DESCRIPTION, APP_NAME, FOUNDING_DATE, PRICE_RANGE, SERVER_PRODUCTION_URL } from "@/config/env";


export const COMPANY_CONFIG = {
    name: APP_NAME,
    legalName: APP_DESCRIPTION,
    url: SERVER_PRODUCTION_URL,

    logo: {
        url: `${SERVER_PRODUCTION_URL}/logo/logomain.png`,
        width: 500,
        height: 500,
    },

    foundingDate: FOUNDING_DATE,
    priceRange: PRICE_RANGE,

    socialLinks: [
        "https://www.facebook.com/proudnepal",
        "https://www.instagram.com/proudnepal",
        "https://www.tiktok.com/@proudnepal",
        "https://www.youtube.com/@proudnepal",
    ],

    // Optional but useful later
    brand: {
        "@type": "Brand",
        name: APP_NAME,
        logo: `${SERVER_PRODUCTION_URL}/logo/logomain.png`,
    },
};
