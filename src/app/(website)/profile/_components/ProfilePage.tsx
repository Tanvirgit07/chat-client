/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

// **Form schema**
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z
    .string()
    .min(5, { message: "Bio must be at least 5 characters." })
    .max(200, { message: "Bio must not exceed 200 characters." }),
});

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;
  const userId = session?.data?.user?.id;

  // ---------- 🔥 Fetch Single User ----------
  const { data: userData } = useQuery({
    queryKey: ["singleUser", userId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/single-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch user");

      return res.json();
    },
    enabled: !!TOKEN && !!userId,
  });

  // ---------- 🔥 Initialize Form ----------
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "" },
  });

  // ---------- 🔥 Set form values after fetching user ----------
  useEffect(() => {
    if (userData?.user) {
      form.setValue("name", userData.user.fullName || "");
      form.setValue("bio", userData.user.bio || ""); // BIO not available, fallback to empty string
      setProfileImage(userData.user.profileImage || null); // FIXED IMAGE FIELD
    }
  }, [userData, form]);

  // ---------- 🔥 Image Upload ----------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/update-profile`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setProfileImage(data.imageUrl);
        toast.success("Profile image updated!");
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploadingImage(false);
    }
  };

  // ---------- 🔥 Submit Name + Bio ----------
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSavingForm(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/update-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            fullName: values.name,
            bio: values.bio,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile saved successfully!");
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingForm(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-start md:items-stretch relative z-10 w-full max-w-4xl bg-black/10 backdrop-blur-sm border border-white rounded-3xl p-8 gap-8">

        {/* Left - Image + Form */}
        <div className="flex-1 md:w-2/3 flex flex-col justify-start">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Profile details
          </h2>

          {/* Profile Image */}
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                {profileImage ? (
                  <Image
                    width={80}
                    height={80}
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="text-white" size={24} />
                )}
              </div>
            </label>

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />

            <div>
              <span className="text-gray-300 text-sm block">
                Upload profile image
              </span>
              {uploadingImage && (
                <span className="text-xs text-yellow-400">Uploading...</span>
              )}
            </div>
          </div>

          {/* Name + Bio Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        className="w-full bg-transparent border border-white text-white placeholder-gray-400 rounded-lg px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        {...field}
                        rows={4}
                        className="w-full bg-transparent border border-white text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={savingForm}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full transition-all mt-6"
              >
                {savingForm ? "Saving..." : "Save Profile"}
              </Button>

            </form>
          </Form>
        </div>

        {/* Right Image */}
        <div className="flex-1 md:w-1/3 flex justify-center items-center">
          <Image
            src="/images/chat-auth1.webp"
            width={200}
            height={250}
            alt="chat decoration"
            className="rounded-xl"
          />
        </div>

      </div>
    </div>
  );
}
