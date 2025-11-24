import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;       // corresponds to fullName
      email?: string | null;
      profileImage?: string;
      bio?: string;
      accessToken: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;         // corresponds to fullName
    email?: string | null;
    profileImage?: string;
    bio?: string;
    accessToken: string;
  }
}
