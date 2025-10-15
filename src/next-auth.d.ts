import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string; // Add accessToken to Session
    user: {
      id: string; // Add the 'id' property here
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    id: string; // Add the 'id' property here
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback */
  interface JWT {
    accessToken?: string; // Add accessToken to JWT
  }
}
