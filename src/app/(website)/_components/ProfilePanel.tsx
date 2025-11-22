"use client";

import React from "react";
import { User } from "./QuickChat";

interface ProfilePanelProps {
  selectedUser: User;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ selectedUser }) => {
  return (
    <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-purple-500/20 flex flex-col">
      <div className="p-6 text-center border-b border-purple-500/20">
        <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          {selectedUser.avatar}
        </div>
        <h2 className="text-white text-xl font-semibold">{selectedUser.name}</h2>
        <p className="text-gray-400 text-sm mt-1">{selectedUser.bio}</p>
      </div>

      <div className="p-6">
        <h3 className="text-white font-semibold mb-4">Media</h3>
      </div>

      <div className="mt-auto p-6">
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-full transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePanel;
