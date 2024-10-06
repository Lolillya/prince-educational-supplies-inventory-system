import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByUsername } from "./data/user";
import { LoginSchema } from "./schemas";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validationResult = LoginSchema.safeParse(credentials);

        if (!validationResult.success) return null;

        const { username, password } = validationResult.data;
        const user = await getUserByUsername(username);

        if (user && user.password === password) {
          const role =
            user.personal_details.admins[0]?.role.role_name ??
            user.personal_details.employees[0]?.role.role_name ??
            null;

          return {
            authentication_id: user.authentication_id,
            personal_details_id: user.personal_details_id,
            username: user.username,
            first_name: user.personal_details.first_name,
            last_name: user.personal_details.last_name,
            role,
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        Object.assign(token, {
          authentication_id: user.authentication_id,
          personal_details_id: user.personal_details_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        });
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          authentication_id: token.authentication_id,
          personal_details_id: token.personal_details_id,
          username: token.username,
          first_name: token.first_name,
          last_name: token.last_name,
          role: token.role,
        };
      }
      return session;
    },
  },
};

export default authConfig;
