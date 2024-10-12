import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string | undefined;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string | undefined;
  }
}
