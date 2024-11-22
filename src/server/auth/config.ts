import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Roles } from "@prisma/client";
import { db } from "~/server/db";
import { LoginSchema } from "~/schemas";
import { getUserByUsername } from "../data/user";
import { getUserRole } from "../data/user";
import { User } from "next-auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Roles;
      username: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { username, password } = validatedFields.data;

          const user = await getUserByUsername(username);

          if (user && user.password === password) {
            const role = await getUserRole(user.personal_details_id);
            console.log(`Role: ${role}`);
            // console.log(user);

            return {
              id: user.authentication_id,
              username: user.username,
              firstName: user.personal_details.first_name,
              lastName: user.personal_details.last_name,
              role: role?.Role.Role_name,
            } as unknown as User;
          }
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  debug: true,
} satisfies NextAuthConfig;
