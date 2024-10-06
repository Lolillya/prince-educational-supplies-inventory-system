"use server";

import { AuthError } from "next-auth";
import { type z } from "zod";
import { signIn, signOut } from "~/auth";
import { getUserByUsername, getUserRole } from "~/data/user";
import { LoginSchema } from "~/schemas";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validationResult = LoginSchema.safeParse(values);

  if (!validationResult.success) {
    return { error: "Invalid fields!" };
  }

  const { username, password } = validationResult.data;

  try {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    return handleSignInResult(result, username);
  } catch (error) {
    return handleLoginError(error);
  }
};

const handleSignInResult = async (result: any, username: string) => {
  if (!result || result.error) {
    return { error: result?.error || "Login failed!" };
  }

  const user = await getUserByUsername(username);
  if (!user) {
    return { error: "User not found!" };
  }

  const role = await getUserRole(user.personal_details_id);
  if (!role) {
    return { error: "User does not have a valid role!" };
  }

  return { success: true, role };
};

const handleLoginError = (error: unknown) => {
  if (error instanceof AuthError) {
    return {
      error:
        error.type === "CredentialsSignin"
          ? "Invalid credentials!"
          : "Authentication failed!",
    };
  }

  return { error: "An unexpected error occurred!" };
};

export const logout = async () => {
  await signOut({ redirectTo: "/auth/login" });
  window.location.reload();
};
