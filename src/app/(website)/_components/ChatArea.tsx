"use client";

import React from "react";
import { Send, Info } from "lucide-react";
import { User } from "./QuickChat";

interface ChatAreaProps {
  selectedUser: User;
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedUser }) => {
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
          <button className="text-gray-400 hover:text-white">
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6">
        {/* Messages will go here */}
      </div>

      {/* Input */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 bg-purple-900/30 text-white placeholder-gray-400 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          <button className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white">
            {/* Optional Image icon */}
          </button>
          <button className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white hover:bg-purple-700">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
