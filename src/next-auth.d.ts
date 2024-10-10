import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    Authentication_Id: string;
    personal_Details_Id: string;
    username: string;
    password: string;
  }
}
