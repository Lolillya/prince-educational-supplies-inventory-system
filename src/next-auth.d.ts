import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      Role?: string;
      id?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    Role?: string;
    id?: string;
  }
}
