import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      authentication_id: string;
      personal_details_id: string;
      username: string;
      first_name: string;
      last_name: string;
      role: string; // Ensure this matches the role data you're working with
    } & DefaultSession["user"];
  }
}
