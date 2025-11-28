import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import jwt from "jsonwebtoken";

import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET,
  JWT_SECRET,
  JWT_EXPIRES_IN,
} from "@/config/env";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: NEXTAUTH_SECRET,

  callbacks: {
     // JWT callback — attach backend JWT to token
     
     async jwt({ token, user }) {
      if (user) {
 
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = !!user.emailVerified;

        token.backendJwt = jwt.sign(
          { 
            id: token.id,
            email: token.email,
            role: token.role,
            emailVerified: token.emailVerified,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
      }
      return token;
    },

     // Session callback — exposes backend JWT to UI
    async session({
      session,
      token,
    }: {
      session: Session & { backendJwt?: string };
      token: JWT & { backendJwt?: string };
    }): Promise<Session> {
      session.backendJwt = token.backendJwt;
      
      if (token?.id) session.user.id = token.id;
      if (token?.role) session.user.role = token.role;
      if (token?.emailVerified !== undefined)
        session.user.emailVerified = token.emailVerified;

    
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
