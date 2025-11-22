"use client";

import React, { useRef } from "react";
import { Send, Image as ImageIcon, Info } from "lucide-react";
import { User } from "./QuickChat";

interface ChatAreaProps {
  selectedUser: User;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log("Selected files:", e.target.files);
      // এখানে আপনার image/file upload logic handle করবেন
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl">
              {selectedUser.avatar}
            </div>
            <h3 className="text-white font-semibold">{selectedUser.name}</h3>
          </div>
          <div className="text-gray-400 hover:text-white">
            <Info size={20} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6">
        {/* Messages will go here */}
      </div>

      {/* Input */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="flex items-center gap-3 relative">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />

          {/* Icon */}
          <div
            onClick={handleIconClick}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
          >
            <ImageIcon size={20} />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 bg-purple-900/30 text-white placeholder-gray-400 rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />

          {/* Send button */}
          <button className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
