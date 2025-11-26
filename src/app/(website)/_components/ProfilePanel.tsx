"use client";

import React from "react";
import { User } from "./QuickChat";
import Image from "next/image";

interface ProfilePanelProps {
  selectedUser: User;
  sharedMedia: string[];
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ selectedUser, sharedMedia }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-96 bg-black/50 backdrop-blur-2xl border-l border-purple-500/30 flex flex-col">
      <div className="p-8 text-center border-b border-purple-500/20">
        <div className="w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
          {selectedUser.profileImage ? (
            <Image
              width={160}
              height={160}
              src={selectedUser.profileImage}
              alt={selectedUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-6xl font-bold">
              {getInitials(selectedUser.name)}
            </span>
          )}
        </div>
        <h2 className="text-white text-3xl font-bold">{selectedUser.name}</h2>
        <p className="text-gray-400 text-sm mt-2">{selectedUser.email || "No email"}</p>
        <p className="text-green-400 text-lg font-medium mt-3 flex items-center justify-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          {selectedUser.status === "Online" ? "Online" : "Offline"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-white text-xl font-bold mb-6">Shared Media</h3>
        
        {sharedMedia.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No media shared yet</p>
            <p className="text-gray-600 text-sm mt-2">Send photos to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {sharedMedia.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-lg"
              >
                <Image
                  fill
                  src={url}
                  alt="Shared media"
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-purple-500/20">
        <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-105 shadow-lg">
          Block User
        </button>
      </div>
    </div>
  );
};

export default ProfilePanel;