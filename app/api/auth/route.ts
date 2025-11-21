import { Google_Client_ID, Google_Client_Secret, NEXTAUTH_SECRET } from "@/config/env";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

NextAuth({
    providers : [
        GoogleProvider({
            clientId: Google_Client_ID,
            clientSecret: Google_Client_Secret
        })
    ],

    secret: NEXTAUTH_SECRET
})