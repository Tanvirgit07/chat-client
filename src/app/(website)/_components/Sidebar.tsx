"use client";

import React from "react";
import { Search, MoreVertical } from "lucide-react";
import { User } from "./QuickChat";

interface SidebarProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ users, selectedUser, onSelectUser }) => {
  return (
    <div
      className={`bg-black/40 backdrop-blur-xl border-r border-purple-500/20 flex flex-col transition-all duration-300 ${
        selectedUser ? "w-80" : "w-1/2"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">QuickChat</span>
          </div>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search User..."
            className="w-full bg-purple-900/30 text-white placeholder-gray-400 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-all ${
              selectedUser?.id === user.id
                ? "bg-purple-600/30 border-l-4 border-purple-500"
                : "hover:bg-purple-900/20"
            }`}
          >
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-xl">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
