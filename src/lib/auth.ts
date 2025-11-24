/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token-website",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const response = await res.json();
          console.log("🔎 API Response:", response);

          if (!res.ok || !response?.success) {
            throw new Error(response.message || "Login failed");
          }

          const { id, fullName, email, profileImage, bio } = response.data;
          const accessToken = response.accessToken;

          return {
            id,
            name: fullName, // 👈 fullName কে name হিসাবে সেট
            email,
            profileImage,
            bio,
            accessToken,
          };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Authentication failed. Try again.";

          throw new Error(message);
        }
      },
    }),
  ],

  callbacks: {
    // ---- JWT Token Build ---
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.profileImage = user.profileImage;
        token.bio = user.bio;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    // ---- Session Build ----
    async session({ session, token }: { session: any; token: JWT }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        profileImage: token.profileImage,
        bio: token.bio,
        accessToken: token.accessToken,
      };
      return session;
    },
  },
};
