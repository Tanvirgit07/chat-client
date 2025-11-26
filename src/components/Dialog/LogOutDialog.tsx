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

  // যদি লোডিং হয় তাহলে কিছু দেখাবে না (অপশনাল)
  if (status === "loading") return null;

  // লগইন করা আছে কিনা চেক
  const isLoggedIn = !!session?.user;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isLoggedIn ? (
          <button className="block w-full text-white px-4 py-2 rounded hover:bg-purple-700/30 transition-colors text-left">
            Logout
          </button>
        ) : (
          <button className="block w-full text-white px-4 py-2 rounded hover:bg-purple-700/30 transition-colors text-left">
            Login
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] bg-black/90 border border-purple-500/30 text-white shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {isLoggedIn ? "Confirm Logout" : "Login to Continue"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isLoggedIn
              ? "Are you sure you want to logout from your account?"
              : "You need to login to access this feature."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="border-gray-500 text-gray-200 hover:bg-gray-700/40"
            >
              Cancel
            </Button>
          </DialogClose>

          {isLoggedIn ? (
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}