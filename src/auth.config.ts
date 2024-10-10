import { NextAuthConfig } from "next-auth";
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

          // Get the user by username
          const user = await getUserByUsername(username);
          // console.log(user);

          // Check if user exists and password matches
          if (user && user.password === password) {
            // Return a simplified version of the user for NextAuth
            const role = await getUserRole(user.personal_Details_Id);
            // console.log(role)
            return {
              id: user.Authentication_Id,
              username: user.username,
              firstName: user.Personal_Details.firstName,
              lastName: user.Personal_Details.lastName,
              role: role,
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
