"use client";

import React, { useEffect, useState } from "react";
import { Upload, Camera } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

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

  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken;
  const userId = session?.user?.id;

  // ফিক্স: সঠিক নামে ডাটা নেওয়া হচ্ছে
  const { data: userResponse } = useQuery({
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

  const user = userResponse?.user; // এখানে সঠিক ডাটা পাচ্ছি

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "" },
  });

  // ডাটা আসার সাথে সাথে ফর্ম + ইমেজ সেট করা
  useEffect(() => {
    if (user) {
      form.setValue("name", user.fullName || "");
      form.setValue("bio", user.bio || "");
      setProfileImage(user.profileImage || null);
    }
  }, [user, form]);

  // ইমেজ আপলোড – ইনস্ট্যান্ট প্রিভিউ + সার্ভারে পাঠানো
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ইনস্ট্যান্ট লোকাল প্রিভিউ (সবচেয়ে জরুরি)
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
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
        setProfileImage(data.imageUrl || reader.result); // সার্ভার থেকে URL পেলে সেটা, না পেলে লোকাল
        toast.success("Profile picture updated!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

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

      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingForm(false);
    }
  };

  // লাইভ প্রিভিউর জন্য রিয়েল-টাইম ভ্যালু
  const currentName = form.watch("name") || user?.fullName || "Your Name";
  const currentBio = form.watch("bio") || user?.bio || "No bio yet";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-pink-950 flex items-center justify-center lg:p-4 p-0 ">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

        {/* Left Side – Edit Form */}
        <div className="order-2 md:order-1 space-y-8 p-4 lg:p-0">
          <h2 className="text-3xl font-bold text-white text-center md:text-left">Edit Profile</h2>

          <div className="flex justify-center md:justify-start">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-purple-500/30 shadow-2xl">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white/60" />
                  </div>
                )}
              </div>

              <label
                htmlFor="profile-upload"
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-10 h-10 text-white" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>
          </div>

          {uploadingImage && (
            <p className="text-center md:text-left text-yellow-400 text-sm animate-pulse">
              Uploading image...
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your name"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write something about yourself..."
                        rows={5}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-xl px-5 py-4 resize-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={savingForm || uploadingImage}
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-purple-500/30 transform hover:scale-[1.02] transition-all"
              >
                {savingForm ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Right Side – Live Preview */}
        <div className="order-1 md:order-2 flex items-center justify-center">
          <div className="w-full max-w-md bg-black/40 backdrop-blur-xl lg:rounded-3xl rounded-none border border-white/10 p-10 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-300 mb-8 text-center">Live Preview</h3>

            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-purple-500/40 shadow-2xl mb-8">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Preview"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Upload className="w-20 h-20 text-white/50" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-3">{currentName}</h1>
            <p className="text-gray-400 text-center mb-6">{user?.email || "your@email.com"}</p>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-gray-300 text-center italic leading-relaxed">
                {currentBio}
              </p>
            </div>

            <div className="mt-8 text-center">
              <span className="px-5 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                Updated in Real-time
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}