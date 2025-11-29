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
          {isLoggedIn ? (
            <>
              Logout
            </>
          ) : (
            <>
              Login
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-gray-950/95 backdrop-blur-xl border border-purple-500/20 text-white rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {isLoggedIn ? "Ready to Leave?" : "Welcome Back!"}
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            {isLoggedIn
              ? "You'll be logged out from your account. Come back soon! 👋"
              : "Login to unlock all premium features and continue your journey."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-3 sm:justify-end mt-6">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="flex-1sm:flex-initial px-8 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </Button>
          </DialogClose>

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial px-8 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              className="flex-1 sm:flex-initial px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Login Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}