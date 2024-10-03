import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      Role?: string;
      Firstname?: string;
      Lastname?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    Role?: string;
    id?: string;
    Firstname?: string;
    Lastname?: string;
  }
}