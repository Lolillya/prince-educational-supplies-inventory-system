"use server";

import { AuthError } from "next-auth";
import { type z } from "zod";
import { signIn, signOut } from "~/auth";
import { getUserByUsername, getUserRole } from "~/data/user";
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
    console.log("Fetched User Data:", JSON.stringify(user, null, 2));

    if (user) {
      // Extract role from the user object
      const role = await getUserRole(user.personal_details_id);

      if (!role) {
        return { error: "User does not have a valid role!" };
      }

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
    await signOut({ redirect: false }); // Do not redirect automatically
    // Use the router to redirect manually
    const router = useRouter();
    router.push("/auth/login"); // Redirect to the login page
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
