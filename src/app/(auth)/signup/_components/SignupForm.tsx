"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

// ----- Zod Schema -----
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignupForm() {
  // ----- React Hook Form -----
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  // ----- Submit Handler -----
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form Values:", values);
  }

  return (
    <div className="flex h-screen gap-[250px]">

      {/* Left Side Image */}
      <div className="w-1/2 relative flex items-center justify-end">
        <Image 
          src="/images/chat-auth1.webp" 
          alt="Signup Background" 
          width={300}
          height={500}
          className="object-contain"
        />
      </div>

      {/* Right Side Form */}
      <div className="w-1/2 flex items-center justify-start p-10">
        <div className="w-full max-w-sm bg-white/5 p-6 rounded-xl backdrop-blur-xl shadow-lg border">
        <h1 className="text-white text-2xl font-bold mb-8">Sign Up</h1>
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
                      <Input placeholder="Enter your full name" {...field} />
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
                      <Input placeholder="example@gmail.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full">Signup</Button>
              <p className="text-white">Already have an account? <Link href="/signin" className="text-[#ec4899] hover:border-b border-[#ec4899] cursor-pointer">Signin here</Link></p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
