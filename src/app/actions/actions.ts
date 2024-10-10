"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "~/auth";
import { getUserByUsername } from "~/data/user";
import { LoginSchema } from "~/schemas";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) return { error: "invalid fields" };

  const { username, password } = validatedFields.data;

  console.log("username: ", username);
  console.log("password: ", password);

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    const user = await getUserByUsername(username);

    console.log(user);
    // if (user) {
    //   const role = user.Personal_Details.Admin[0]?.Role.Role_name

    // return { success: true, role };
    return user;
    // }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};

export const logout = async () => {
  await signOut({
    redirectTo: "/auth/login",
  }).then(() => {
    window.location.reload();
  });
};
