"use client";

import React, { useState } from "react";
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

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters." })
    .max(200, { message: "Bio must not exceed 200 characters." }),
});

function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", bio: "" },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Profile saved:", { ...values, profileImage });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-start md:items-stretch relative z-10 w-full max-w-4xl bg-black/10 backdrop-blur-sm border border-white rounded-3xl p-8 gap-8">
        {/* Form Side */}
        <div className="flex-1 md:w-2/3 flex flex-col justify-start">
          <h2 className="text-white text-2xl font-semibold mb-6">
            Profile details
          </h2>

          {/* Profile Image Upload */}
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="profile-upload" className="cursor-pointer">
              <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
                {profileImage ? (
                  <Image
                    width={400}
                    height={400}
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
            />
            <span className="text-gray-300 text-sm">upload profile image</span>
          </div>

          {/* Shadcn Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Fuga Impedit tempo"
                        {...field}
                        className="w-full bg-transparent border border-white text-white placeholder-gray-400 rounded-lg px-4 py-3 "
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              {/* Bio Field */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Harum ut et magna qu"
                        {...field}
                        rows={4}
                        className="w-full bg-transparent border border-white text-white placeholder-gray-400 rounded-lg px-4 py-3 "
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-full transition-all mt-6"
              >
                Save
              </Button>
            </form>
          </Form>
        </div>

        {/* Image Side */}
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

export default ProfilePage;
