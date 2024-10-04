import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByUsername } from "./data/user";
import { LoginSchema } from "./schemas";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.log("Validation failed", validatedFields.error);
          return null; // Return null if validation fails
        }

        const { username, password } = validatedFields.data;
        console.log("Attempting to log in with username:", username);

        // Fetch user by username
        const user = await getUserByUsername(username);

        if (!user) {
          console.log("User not found");
          return null; // User does not exist
        }

        // Verify password
        if (user.password !== password) {
          console.log("Password mismatch");
          return null; // Passwords do not match
        }

        // Successful login
        console.log("Login successful", user);
        return {
          authentication_id: user.authentication_id,
          personal_details_id: user.personal_details_id,
          username: user.username,
          first_name: user.personal_details.first_name,
          last_name: user.personal_details.last_name,
          role: user.personal_details.admins[0]?.role.role_name || null,
        };
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
        console.log("User in JWT callback:", user);
        token.role = user.role; // Ensure role is set
      }
      console.log("Token in JWT callback:", token);
      return token;
    },

    async session({ session, token }) {
      console.log("Session in session callback:", session);
      console.log("Token in session callback:", token);
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
