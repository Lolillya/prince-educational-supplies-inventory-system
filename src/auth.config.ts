import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByUsername } from "./data/user";
import { LoginSchema } from "./schemas";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { username, password } = validatedFields.data;
          const user = await getUserByUsername(username);

          // Verify credentials
          if (user && user.password === password) {
            // Extract role from user details
            let role = null;

            if (user.personal_details.admins.length > 0) {
              role = user.personal_details.admins[0].role.role_name; // For admins
            } else if (user.personal_details.employees.length > 0) {
              role = user.personal_details.employees[0].role.role_name; // For employees
            }

            // Return user details along with role
            return {
              authentication_id: user.authentication_id,
              personal_details_id: user.personal_details_id,
              username: user.username,
              first_name: user.personal_details.first_name,
              last_name: user.personal_details.last_name,
              role, // Ensure role is set correctly here
            };
          }
        }
        return null; // Return null if credentials are invalid
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.authentication_id = user.authentication_id;
        token.personal_details_id = user.personal_details_id;
        token.username = user.username;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.role = user.role; // Ensure this is set
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
          role: token.role, // Make sure role is included
        };
      }
      return session;
    },
  },
};

export default authConfig;
