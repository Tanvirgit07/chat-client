"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export function SigninForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (res?.error) {
        throw new Error(res.error)
      }

      toast.success("Login Successfully!")
      router.push("/")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 lg:items-center lg:justify-center" >

      {/* 🔥 MOBILE IMAGE AT TOP */}
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

      <div className="flex flex-col-reverse lg:flex-row ">
        {/* 🔥 LEFT IMAGE SECTION (DESKTOP ONLY) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center xl:justify-end px-6 xl:px-12 2xl:px-20 lg:py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 animate-pulse" />
            <Image
              src="/images/chat-auth1.webp"
              alt="Signin Background"
              width={400}
              height={400}
              className="relative object-contain w-48 h-auto sm:w-56 md:w-64 lg:w-72 xl:w-96 2xl:w-[450px] drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* 🔥 RIGHT FORM SECTION */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start px-4 sm:px-6 md:px-8 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">

            {/* MOBILE HEADER */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h2 className="text-white text-3xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                QuickChat
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Connect instantly, chat securely</p>
            </div>

            <div className="bg-black/40 backdrop-blur-2xl p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl border border-purple-500/20 transition-all duration-300 hover:border-purple-500/30">

              {/* FORM HEADER */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                  Sign in to continue to QuickChat
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">

                  {/* EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-xs sm:text-sm font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 sm:h-11 md:h-12 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                            placeholder="your@email.com"
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
                          <Input
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 sm:h-11 md:h-12 rounded-xl focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm sm:text-base"
                            placeholder="Enter your password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />

                  {/* FORGOT PASSWORD */}
                  <div className="text-right pt-1">
                    <Link
                      href="/forgot-password"
                      className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* DIVIDER */}
                  <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-black/40 px-3 sm:px-4 text-gray-400">New to QuickChat?</span>
                    </div>
                  </div>

                  {/* SIGNUP LINK */}
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="text-pink-400 hover:text-pink-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                      >
                        Create account
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                    </p>
                  </div>

                </form>
              </Form>
            </div>

            {/* FOOTER */}
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6 px-2">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy Policy
              </Link>
            </p>

          </div>
        </div>
      </div>

    </div>
  )
}
