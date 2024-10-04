import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      Authentication_Id: string;
  personal_Details_Id: string;
  username: string;
  password: string;
  Personal_Details: {
    firstName: string;
    lastName: string;
    Role: {
      Role_name: Roles;
    } | null;
  } | null;
    } & DefaultSession["user"];
  }
}