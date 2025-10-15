import { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import sg from "@sendgrid/mail"; // Import SendGrid

sg.setApiKey(process.env.SENDGRID_API_KEY as string); // Set SendGrid API Key

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

        const msg = {
          to: email,
          from: provider.from as string,
          subject: `Sign in to ${host}`,
          text: `Please use the following link to sign in to ${host}: ${url}`,
          html: html,
        };
        await sg.send(msg);
        return Promise.resolve();
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
    async jwt({ token, user, account, trigger, session }) {
      // If the user is signing in, add their ID and name to the token
      if (user) {
        token.id = user.id;
        token.name = user.name;
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
