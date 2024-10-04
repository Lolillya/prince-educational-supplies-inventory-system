"use server";

import { AuthError } from "next-auth";
import { type z } from "zod";
import { signIn, signOut } from "~/auth";
import { getUserByUsername } from "~/data/user";
import { LoginSchema } from "~/schemas";

// Login action
export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate the input fields
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { username, password } = validatedFields.data;

  console.log("Username: ", username);
  console.log("Password: ", password);

  try {
    // Attempt to sign in using NextAuth credentials provider
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // Don't redirect immediately
    });

    // Check if the login succeeded
    if (!result || result.error) {
      return { error: result?.error || "Login failed!" };
    }

    // Fetch the user by username after successful sign-in
    const user = await getUserByUsername(username);
    console.log(user);

    if (user) {
      // Extract role from the user object depending on their type
      const role = user.personal_details?.admins[0]?.role?.role_name || null;

      return { success: true, role }; // Return role for redirection
    }
    return { error: "User not found!" };
  } catch (error) {
    if (error instanceof AuthError) {
      // Handle NextAuth-specific errors
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Authentication failed!" };
      }
    }

    throw error; // Re-throw unexpected errors
  }
};

// Logout action
export const logout = async () => {
  try {
    await signOut({
      redirect: false, // Prevent immediate redirect after sign-out
    });
    return { success: true };
  } catch (error) {
    return { error: "Logout failed!" };
  }
};
