import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import EmailProvider from "next-auth/providers/email";
import { JWT } from "next-auth/jwt";
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
      },
    }),
    // Add more providers here as needed
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ session, token, user }: { session: Session; token: JWT; user: User }) => {
      console.log("Session Callback User:", user); // Log the user object
      if (session?.user) {
        // session.user.id = user.id; // Temporarily commented out
        // Ensure user.id exists before assigning
        if (user?.id) {
          session.user.id = user.id;
        } else if (token?.sub) { // Fallback to token.sub if user.id is not available
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
