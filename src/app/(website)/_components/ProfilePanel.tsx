"use client";

import React, { useState } from "react";
import { User } from "./QuickChat";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface ProfilePanelProps {
  selectedUser: User;
  sharedMedia: string[];
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ selectedUser, sharedMedia }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="w-full bg-black/50 backdrop-blur-2xl border-l border-purple-500/30 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 text-center border-b border-purple-500/20 flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
            {selectedUser.profileImage ? (
              <Image
                width={160}
                height={160}
                src={selectedUser.profileImage}
                alt={selectedUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {getInitials(selectedUser.name)}
              </span>
            )}
          </div>
          
          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold truncate px-2">
            {selectedUser.name}
          </h2>
          
          <p className="text-gray-400 text-xs sm:text-sm mt-2 truncate px-2">
            {selectedUser.email || "No email"}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-green-400 text-sm sm:text-base lg:text-lg font-medium">
              {selectedUser.status === "Online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Shared Media */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <h3 className="text-white text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              Shared Media
            </h3>
            
            {sharedMedia.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-base sm:text-lg font-medium">
                  No media shared yet
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-2">
                  Send photos to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {sharedMedia.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                  >
                    <Image
                      fill
                      src={url}
                      alt={`Shared media ${index + 1}`}
                      className="object-cover transition-all duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-purple-500/20 flex-shrink-0">
          <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-sm sm:text-base">
            Block User
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 sm:p-3 transition backdrop-blur-sm"
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image
              src={selectedImage}
              alt="Full size preview"
              width={1200}
              height={1200}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePanel;