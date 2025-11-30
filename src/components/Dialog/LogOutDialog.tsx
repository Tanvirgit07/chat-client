"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutModal() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleLogin = () => {
    router.push("/signin");
  };

  if (status === "loading") return null;

  const isLoggedIn = !!session?.user;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`
            w-full justify-start gap-3 px-4 py-3 rounded-xl text-left
            font-medium transition-all duration-200
            ${isLoggedIn 
              ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
              : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            }
          `}
        >
          {isLoggedIn ? "Logout" : "Login"}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          w-[92%] max-w-sm sm:max-w-md 
          bg-gray-950/95 backdrop-blur-xl 
          border border-purple-500/20 
          text-white rounded-2xl shadow-2xl
          px-5 py-6 sm:px-8 sm:py-7
        "
      >
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <DialogTitle
            className="
              text-2xl sm:text-3xl font-bold 
              bg-gradient-to-r from-purple-400 to-pink-400 
              bg-clip-text text-transparent
            "
          >
            {isLoggedIn ? "Ready to Leave?" : "Welcome Back!"}
          </DialogTitle>

          <DialogDescription className="text-gray-300 text-base leading-relaxed">
            {isLoggedIn
              ? "You'll be logged out from your account. Come back soon! 👋"
              : "Login to unlock all premium features and continue your journey."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter
          className="
            flex flex-col sm:flex-row 
            gap-3 mt-6
          "
        >
          {/* Cancel Button */}
          <DialogClose asChild>
            <Button
              variant="outline"
              className="
                w-full sm:w-auto
                px-6 py-2.5 
                bg-gray-800 
                border-gray-700
                text-gray-200
                hover:bg-gray-700 hover:text-white
                transition-all duration-300
                rounded-xl
              "
            >
              Cancel
            </Button>
          </DialogClose>

          {/* Action Button */}
          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              className="
                w-full sm:w-auto 
                px-6 py-2.5 
                bg-gradient-to-r from-red-600 to-rose-600 
                hover:from-red-700 hover:to-rose-700 
                text-white font-semibold 
                shadow-lg hover:shadow-red-500/20 
                transition-all duration-300 transform hover:scale-105
                rounded-xl
              "
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              className="
                w-full sm:w-auto
                px-6 py-2.5 
                bg-gradient-to-r from-purple-600 to-pink-600 
                hover:from-purple-700 hover:to-pink-700 
                text-white font-semibold 
                shadow-lg hover:shadow-purple-500/30 
                transition-all duration-300 transform hover:scale-105
                rounded-xl
              "
            >
              Login Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
