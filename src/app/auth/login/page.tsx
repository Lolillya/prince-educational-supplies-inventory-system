"use client";

import { Input } from "~/components/ui/input";
import Company_Logo from "public/Company_Logo.svg";
import Image from "next/image";
import type * as z from "zod";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginSchema } from "~/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DEFAULT_ADMIN_REDIRECT, DEFAULT_EMPLOYEE_REDIRECT } from "~/routes";
import { login } from "~/app/actions/actions";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface ErrorResponse {
  error: string;
}

interface LoginResponse {
  role: string;
  personal_details: { first_name: string | null; last_name: string | null; contact: string | null; company: string | null; notes: string | null; };
  username: string;
  password: string;
  personal_details_id: string;
  authentication_id: number;
}

const isErrorResponse = (data: any): data is ErrorResponse => 'error' in data;
const isLoginResponse = (data: any): data is LoginResponse => 'role' in data;

const LoginPage = () => {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setSuccess("");
    setIsPending(true);

    try {
      const data = await login(values);

      if (!data) {
        setSuccess("Login failed, please try again!");
        return;
      }

      if (isErrorResponse(data)) {
        setSuccess(data.error);
        return;
      }

      if (isLoginResponse(data)) {
        switch (data.role) {
          case "ADMIN":
            router.push(DEFAULT_ADMIN_REDIRECT);
            break;

          default:
            router.push(DEFAULT_EMPLOYEE_REDIRECT);
        }


      }
    } catch (error) {
      console.error("Login error: ", error);
      setSuccess("An error occurred during login");
    } finally {
      setIsPending(false);
    }
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
        {/* Company Logo */}
        <div className="mb-8 flex items-center gap-3 p-3">
          <Image src={Company_Logo} alt="Company Logo" width={160} />
          <Label className="text-5xl font-bold">
            Prince Educational Supply
          </Label>
        </div>

        {/* Email Field */}
        <div className="mb-6 flex flex-col gap-1">
          <Label className="ml-3">Email</Label>
          <div className="relative flex items-center">
            <Input
              placeholder="Email"
              required
              {...form.register("username")}
              disabled={isPending}
              className="placeholder:text-textGray"
            />
            <Label className="absolute right-3 font-light text-textGray">
              @prince.com.ph
            </Label>
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-6 flex flex-col gap-1">
          <Label className="ml-3">Password</Label>
          <div className="relative flex items-center">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              required
              {...form.register("password")}
              disabled={isPending}
              className="placeholder:text-textGray"
            />
            <div
              className="absolute right-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye color="#989FB3" />
              ) : (
                <EyeClosed color="#989FB3" />
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {success && <p className="mb-4 text-center text-red">{success}</p>}

        {/* Submit Button */}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Logging in..." : "Sign in"}
        </Button>
      </form>
    </section>
  );
};

export default LoginPage;
