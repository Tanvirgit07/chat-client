"use client";

import React, { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Link from "next/link";
import { User } from "./QuickChat";
import { LogoutModal } from "@/components/Dialog/LogOutDialog";

interface SidebarProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  selectedUser,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black/40 backdrop-blur-xl border-r border-purple-500/20 flex flex-col w-full h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-purple-500/20 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/chat-auth1.webp"
                width={200}
                height={200}
                alt="QuickChat Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white font-semibold text-base sm:text-lg">
              QuickChat
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="text-gray-400 hover:text-white cursor-pointer transition">
                <MoreVertical size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 bg-black/90 border border-purple-500/30 p-2 rounded-lg">
              <Link
                href="/profile"
                className="block w-full text-white px-4 py-2 rounded hover:bg-purple-700/30 transition-colors text-sm"
              >
                Profile
              </Link>
              <div className="border-t border-purple-500/30 my-1" />
              <LogoutModal />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search User..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-purple-900/30 text-white placeholder-gray-400 rounded-full py-2 pl-9 sm:pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-purple-500/10">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-all ${
                  selectedUser?.id === user.id
                    ? "bg-purple-600/30 border-l-4 border-purple-500"
                    : "hover:bg-purple-900/20"
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600">
                  {user.profileImage ? (
                    <Image
                      width={48}
                      height={48}
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-base sm:text-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm sm:text-base truncate">
                    {user.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">
                    {user.status || "Offline"}
                  </p>
                </div>

                {/* Online Indicator */}
                {user.status === "Online" && (
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;