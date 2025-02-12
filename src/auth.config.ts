import { NextAuthConfig, User } from "next-auth";
import { LoginSchema } from "./schemas";

import Credentials from "next-auth/providers/credentials";
import { getUserByUsername, getUserRole } from "./server/data/user";
import { Roles } from "@prisma/client";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { username, password } = validatedFields.data;

          const user = await getUserByUsername(username);

          if (user && user.password === password) {
            const role = await getUserRole(user.personal_details_id);

            return {
              id: user.personal_details_id,
              username: user.username,
              firstName: user.personal_details.first_name,
              lastName: user.personal_details.last_name,
              role: role,
            } as unknown as User;
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub as string,
          username: token.username as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          role: token.role as Roles,
        };
      }
      return session;
    },

    // Add additional fields to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
      }
      return token;
    },
  },
};

export default authConfig;
