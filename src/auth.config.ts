import { DefaultSession, NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";

import Credentials from "next-auth/providers/credentials";
import { getUserById, getUserByUsername } from "./data/user";
import { Roles } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      Firstname: string;
      Lastname: string;
      Role: Roles;
    } & DefaultSession["user"];
  }
}

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { username, password } = validatedFields.data;
          console.log("validation success");
          const user = await getUserByUsername(username);

          if (user && user.Password === password) {
            return user;
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      if (user) {
        token.Role = user.Role;
      }

      token.Role = existingUser.Role;
      token.Firstname = existingUser.Firstname;
      token.Lastname = existingUser.Lastname;

      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub as string;
        session.user.Role = token.Role as Roles;
        session.user.Firstname = token.Firstname as string;
        session.user.Lastname = token.Lastname as string;
      }

      return session;
    },
  },
};

export default authConfig;
