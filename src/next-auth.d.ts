import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      lastReportGeneratedAt?: Date;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: string;
    lastReportGeneratedAt?: Date;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback */
  interface JWT {
    id?: string;
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    error?: string;
    lastReportGeneratedAt?: Date;
  }
}
