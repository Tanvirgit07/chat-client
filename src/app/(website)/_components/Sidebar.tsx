"use client";

import React from "react";
import { Search, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "./QuickChat";
import Image from "next/image";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Link from "next/link";

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
            <div className="w-10 h-10 flex items-center justify-center">
              <Image src="/images/chat-auth1.webp" width={200} height={200} alt="image"/>
            </div>
            <span className="text-white font-semibold text-lg">QuickChat</span>
          </div>

          {/* Three-dot Popover */}
<Popover>
  <PopoverTrigger asChild>
    <div className="text-gray-400 hover:text-white cursor-pointer">
      <MoreVertical size={20} />
    </div>
  </PopoverTrigger>
  <PopoverContent className="w-40 bg-black/90 border border-purple-500/30 p-2 rounded-lg">
    <Link
      href="/profile"
      className="block w-full text-white px-4 py-2 rounded hover:bg-purple-700/30 transition-colors"
    >
      Profile
    </Link>
    <div className="border-t border-purple-500/30 my-1" />
    <button
      className="block w-full text-white px-4 py-2 rounded hover:bg-purple-700/30 transition-colors text-left"
      onClick={() => console.log("Logout clicked")}
    >
      Logout
    </button>
  </PopoverContent>
</Popover>

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

      <ScrollArea className="flex-1 scroll-smooth s">
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
               <p className="text-gray-400 text-sm">{user.status}</p>             </div>
          </div>
         ))}
       </ScrollArea>
    </div>
  );
};

export default Sidebar;
