import { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/dbConnect";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from 'nodemailer';
import User from '@/models/User'; // Import the User model

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
    signIn: "/auth/signin", // Custom sign-in page
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
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events.readonly',
        },
      },
    }),
    // Add more providers here as needed
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
    async jwt({ token, user, account, trigger, session }) {
      // If the user is signing in, add their ID and name to the token
      if (user) {
        const dbUser = await User.findById(user.id);
        token.id = user.id;
        token.name = user.name;
        token.lastReportGeneratedAt = dbUser?.lastReportGeneratedAt;
      }
      // If a new account is linked or signed in, store the access token
      if (account) {
        token.accessToken = account.access_token;
      }

      // If the session is being updated (e.g., with a new name)
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      // Ensure the user ID is always present
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return token;
    },
    async session({ session, token }) {
      // Add the user's ID and name from the token to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.lastReportGeneratedAt = token.lastReportGeneratedAt as Date;
      }
      // Add the access token to the session
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};
