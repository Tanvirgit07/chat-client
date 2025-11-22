"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import EmptyState from "./EmptyState";
import ChatArea from "./ChatArea";
import ProfilePanel from "./ProfilePanel";

export interface User {
  id: number;
  name: string;
  status?: string;
  bio?: string;
  avatar: string;
}

const QuickChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users: User[] = [
    { id: 1, name: "GreatStack", status: "Offline", avatar: "🔷" },
    { id: 2, name: "Tony Stark", status: "Offline", bio: "I am Iron man", avatar: "👤" },
    { id: 3, name: "Puneet Chaudhary", status: "Offline", avatar: "👤" },
    { id: 4, name: "Pranav", status: "Offline", avatar: "👤" },
    { id: 5, name: "Jigmet", status: "Offline", avatar: "👤" },
    { id: 6, name: "Savetrees", status: "Offline", avatar: "👤" },
    { id: 7, name: "Thiijan", status: "Offline", avatar: "👤" },
    { id: 8, name: "Arpi", status: "Offline", avatar: "👤" },
    { id: 9, name: "A", status: "Offline", avatar: "👤" },
    { id: 10, name: "Hello Hello", status: "Offline", avatar: "👤" },
    { id: 11, name: "Muhammad Junaid", status: "Offline", avatar: "👤" },
  ];

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex w-[60%] h-[75%] shadow-xl rounded-xl overflow-hidden border">
        {/* Sidebar */}
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />

        {/* Chat Area / Empty State */}
        <div className="flex-1 flex">
          {!selectedUser ? <EmptyState /> : <ChatArea selectedUser={selectedUser} />}
        </div>

        {/* Profile Panel */}
        {selectedUser && <ProfilePanel selectedUser={selectedUser} />}
      </div>
    </div>
  );
};

export default QuickChat;
