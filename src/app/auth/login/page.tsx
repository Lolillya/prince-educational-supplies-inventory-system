"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FaEye } from "react-icons/fa";

import Company_Logo from "public/Company_Logo.svg";
import Image from "next/image";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { LoginSchema } from "~/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { useRouter } from "next/navigation";
import { DEFAULT_ADMIN_REDIRECT, DEFAULT_EMPLOYEE_REDIRECT } from "~/routes";
import { login } from "~/app/actions/actions";

const LoginPage = () => {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>("");

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
    startTransition(async () => {
      try {
        const data = await login(values);

        if (!data) {
          setSuccess("Login failed, please try again!");
          return;
        }

        setSuccess(data.error);

        switch (data.role) {
          case "ADMIN":
            router.push(DEFAULT_ADMIN_REDIRECT);
            break;

          default:
            router.push(DEFAULT_EMPLOYEE_REDIRECT);
        }
      } catch (error) {
        console.error("Login error: ", error);
        setSuccess("An error occured during login");
      }
    });
  };

  return (
    <section className="flex h-screen w-screen flex-col items-center justify-center">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-32 flex items-center gap-3 p-3">
          <Image src={Company_Logo} alt="Company Logo" width={160} />
          <Label className="max-w-72 text-5xl font-bold">
            Prince Educational Supply
          </Label>
        </div>
        <div className="mb-60 flex w-full max-w-md flex-col gap-3 rounded-sm p-3">
          <div className="flex flex-col gap-1">
            <Label className="ml-3">Email</Label>
            <div className="relative flex items-center">
              <Input
                placeholder="Email"
                required
                {...form.register("username")}
                disabled={isPending}
              />
              <Label className="absolute right-3 font-light text-gray-400">
                @prince.com.ph
              </Label>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="ml-3">Password</Label>
            <div className="relative flex items-center">
              <Input
                placeholder="Enter password"
                required
                {...form.register("password")}
                disabled={isPending}
              />
              <FaEye className="absolute right-3" />
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            Login
          </Button>
        </div>
      </form>
    </section>
  );
};

export default LoginPage;
