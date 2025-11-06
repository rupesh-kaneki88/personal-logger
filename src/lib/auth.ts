import { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/dbConnect";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from 'nodemailer';
import User from '@/models/User'; // Import the User model
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: process.env.EMAIL_SERVER_PORT === "465", 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/signin", 
  },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url);
        const appName = "Personal Logger"; // Your application name

        const html = `
        <body style="background: #f9f9f9; color: #333; font-family: Helvetica, Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0;">${appName}</h1>
            </div>
            <div style="padding: 20px 0;">
              <p>Hello,</p>
              <p>Thank you for signing in to ${appName}. Please click the button below to verify your email address and complete your sign-in.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Verify Email
                </a>
              </p>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p>Best regards,<br/>The ${appName} Team</p>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        `;

        try {
          await transporter.sendMail({
            to: email,
            from: provider.from as string,
            subject: `Sign in to ${host}`,
            text: `Please use the following link to sign in to ${host}: ${url}`,
            html: html,
          });
          return Promise.resolve();
        } catch (error) {
          console.error("Error sending verification email:", error);
          return Promise.reject(new Error("Failed to send verification email"));
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
        },
      },
    }),
    
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account, profile }) {
      // This callback is triggered when a user signs in.
      if (account && profile?.email) {
        // Find if a user with this email already exists.
        const existingUser = await User.findOne({ email: profile.email });

        if (existingUser) {
          // If a user exists, check if the sign-in provider is already linked.
          const accountExists = await (await clientPromise).db().collection("accounts").findOne({
            provider: account.provider,
            userId: existingUser._id,
          });

          if (accountExists) {
            // If the account is already linked, allow the sign-in.
            return true;
          }

          // If the account is not linked, link the new account to the existing user.
          await (await clientPromise).db().collection("accounts").insertOne({
            userId: existingUser._id,
            provider: account.provider,
            type: account.type,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            refresh_token: account.refresh_token,
            scope: account.scope,
            token_type: account.token_type,
          });

          // If the provider is Google and the email is verified, update the user's emailVerified status.
          if (account.provider === 'google' && (profile as any).email_verified && !existingUser.emailVerified) {
            await User.updateOne({ _id: existingUser._id }, { $set: { emailVerified: new Date() } });
          }

          // Allow the sign-in to proceed with the existing user.
          return true;
        }
      }
      // If no existing user is found, or for other providers, allow the default sign-in behavior.
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.accessToken = account.access_token;
        token.accessTokenExpires = (account.expires_at as number) * 1000;
        token.refreshToken = account.refresh_token;
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

