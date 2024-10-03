import * as z from "zod";

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
