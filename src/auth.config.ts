import { DefaultSession, NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schemas";

import Credentials from "next-auth/providers/credentials";
import {  getUserByUsername } from "./data/user";
import { Roles } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      Personal_Details: {
        firstName: string,
        lastName: string
        Role: {
          Role_name: Roles
        }
      }
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
          const user = await getUserByUsername(username)
          console.log(user)

          if (user && user.password === password) {
            return user;
          }
        }
        return null;
      },
    }),
  ],

  callbacks: {
    // async jwt({ token, user }) {
    //   if (user) {
    //     // Set the user data in the token only if a user is available
    //     token.id = user.id;
    //     token.Role = user.Role;
    //     token.Firstname = user.Firstname;
    //     token.Lastname = user.Lastname;
    //   } else if (token.sub) {
    //     // Fetch existing user data based on token.sub (user ID)
    //     const existingUser = await getUserById(token.sub);

    //     if (existingUser) {
    //       token.Role = existingUser.;
    //       token.Firstname = existingUser.firstName;
    //       token.Lastname = existingUser.lastName;
    //     }
    //   }

    //   return token;
    // },

    // async session({ token, session }) {
    //   if (token.sub && session.user) {
    //     session.user.id = token.sub as string;
    //     session.user.Role = token.Role as Roles;
    //     session.user.Firstname = token.Firstname as string;
    //     session.user.Lastname = token.Lastname as string;
    //   }

    //   return session;
    // },
  },
};

export default authConfig;
