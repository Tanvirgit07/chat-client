"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { EyeOff, Eye } from "lucide-react"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type SignupFormType = z.infer<typeof formSchema>

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignupFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async (body: SignupFormType) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create user")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data?.message)
      router.push("/signin")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function onSubmit(values: SignupFormType) {
    createUserMutation.mutate(values)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 lg:items-center lg:justify-center">

      {/* 🔥 MOBILE IMAGE */}
      <div className="lg:hidden w-full flex justify-center py-6 sm:py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-15 animate-pulse rounded-full" />
          <Image
            src="/images/chat-auth1.webp"
            alt="QuickChat Mobile"
            width={180}
            height={180}
            className="relative object-contain w-36 sm:w-44 md:w-52"
            priority
          />
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row">

        {/* 🔥 LEFT IMAGE (DESKTOP ONLY) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center xl:justify-end px-6 xl:px-12 2xl:px-20 py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 animate-pulse" />
            <Image
              src="/images/chat-auth1.webp"
              alt="Signup Background"
              width={400}
              height={400}
              className="relative object-contain w-48 h-auto sm:w-56 md:w-64 lg:w-72 xl:w-96 drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* 🔥 RIGHT FORM SECTION */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start px-4 sm:px-6 md:px-8 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">

            {/* MOBILE TITLE */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h2 className="text-white text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                QuickChat
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Create an account to get started</p>
            </div>

            <div className="bg-black/40 backdrop-blur-2xl p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl border border-purple-500/20 hover:border-purple-500/30 transition-all">

              {/* FORM HEADER */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">Create your account</h1>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                  Join QuickChat — fast, secure and private messaging
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">

                  {/* FULL NAME */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs sm:text-sm font-medium">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 sm:h-11 md:h-12 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50"
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs sm:text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 sm:h-11 md:h-12 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50"
                            placeholder="example@gmail.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* PASSWORD */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs sm:text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 sm:h-11 md:h-12 pr-10 rounded-xl focus:ring-2 focus:ring-purple-500/20"
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* SUBMIT */}
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="w-full h-10 sm:h-11 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/40 transition-all"
                  >
                    {createUserMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* LOGIN LINK */}
                  <p className="text-center text-gray-400 text-xs sm:text-sm">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-pink-400 hover:text-pink-300 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </form>
              </Form>
            </div>

            {/* TERMS */}
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms</Link> and{" "}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
