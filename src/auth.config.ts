import { type NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";

import Credentials from "next-auth/providers/credentials";
import { getUserByUsername, getUserRole } from "./data/user";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { username, password } = validatedFields.data;
          console.log("validation success");

          const user = await getUserByUsername(username);

          if (user && user.password === password) {
            const role = await getUserRole(user.personal_details_id);
            return {
              id: user.authentication_id,
              username: user.username,
              firstName: user.personal_details.first_name,
              lastName: user.personal_details.last_name,
              role,
            };
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, token, user }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          username: token.username,
          firstName: token.firstName,
          lastName: token.lastName,
          role: token.role,
        };
      }
      return session;
    },

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
