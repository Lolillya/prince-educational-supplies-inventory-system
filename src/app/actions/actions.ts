"use server";

import { AuthError } from "next-auth";
import { type z } from "zod";
import { signIn, signOut } from "~/auth";
import { getUserByUsername } from "~/server/data/user";
import { LoginSchema } from "~/schemas";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) return { error: "invalid fields" };

  const { username, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    const user = await getUserByUsername(username);

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

// export const updateEmployee = async (employeeForm) => {
//   try {
//     await api.employee.updateEmployee(employeeForm);
//     window.location.reload();
//   } catch {
//     console.log(error);
//   }
// };

// export const createEmployee = async (employeeForm) => {
//   try {
//     return await api.employee.createEmployee(employeeForm);
//   } catch {
//     console.log(error);
//   }
// };
