"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { EyeClosed, EyeOff } from "lucide-react";

// ----- Zod Schema -----
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// TypeScript
type SignupFormType = z.infer<typeof formSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (body: SignupFormType) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data?.message);
      router.push("/signin");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function onSubmit(values: SignupFormType) {
    createUserMutation.mutate(values);
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:gap-[150px]">

      {/* Mobile Logo */}
      <div className="lg:hidden w-full flex justify-center mt-10">
        <Image
          src="/images/chat-auth1.webp"
          alt="Signup Logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Left Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-end">
        <Image
          src="/images/chat-auth1.webp"
          alt="Signup Background"
          width={250}
          height={500}
          className="object-contain"
        />
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start p-6 lg:p-10">
        <div className="w-full max-w-sm bg-white/5 p-6 rounded-xl backdrop-blur-xl shadow-lg border">
          <h1 className="text-white text-2xl font-bold mb-8 text-center lg:text-left">
            Sign Up
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Full Name</FormLabel>
                    <FormControl>
                      <Input className="text-white h-[45px]" placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input className="text-white h-[45px]" placeholder="example@gmail.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password + Eye Button */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="text-white pr-10 h-[45px]"
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />

                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff /> : <EyeClosed />}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Signup
              </Button>

              <p className="text-white text-center lg:text-left">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[#ec4899] hover:border-b border-[#ec4899] cursor-pointer"
                >
                  Signin here
                </Link>
              </p>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
