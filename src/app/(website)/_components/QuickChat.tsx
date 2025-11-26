/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import EmptyState from "./EmptyState";
import ChatArea from "./ChatArea";
import ProfilePanel from "./ProfilePanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSocket from "../../../lib/socketIoConnection";

export interface User {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  email?: string;
  profileImage?: string;
}

export interface ChatMessage {
  _id?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  seen?: boolean;
}

// Define SessionUser type
interface SessionUser {
  _id: string;
  name?: string | null;
  email?: string | null;
  profileImage?: string;
  bio?: string;
  accessToken: string;
}

const QuickChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: session, status } = useSession();

  // Fix _id TypeScript issue
  const rawUser = session?.user as unknown;
  const user: SessionUser | undefined = rawUser
    ? {
        _id: (rawUser as any)._id || (rawUser as any).id || "",
        name: (rawUser as any).name,
        email: (rawUser as any).email,
        profileImage: (rawUser as any).profileImage,
        bio: (rawUser as any).bio,
        accessToken: (rawUser as any).accessToken,
      }
    : undefined;

  const TOKEN = user?.accessToken;
  const myId = user?._id || "";

  // Fetch all users
  const { data: userData } = useQuery({
    queryKey: ["userData"],
    enabled: status === "authenticated" && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/sidebar-user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Fetch messages of selected user
  const { data: selectedUserData } = useQuery({
    queryKey: ["selectedUserData", selectedUser?.id],
    enabled: !!selectedUser && status === "authenticated" && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/selected-user/${selectedUser?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch selected user messages");
      return res.json();
    },
  });

  // Mutation to mark messages as seen
  const markMessageAsSeen = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/markmessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ messageIds }),
        }
      );
      if (!res.ok) throw new Error("Failed to mark messages as seen");
      return res.json();
    },
  });

  // Map API users to frontend users with online status
  useEffect(() => {
    if (userData?.users) {
      const mappedUsers: User[] = userData.users.map((u: any) => ({
        id: u._id,
        name: u.fullName,
        avatar: u.profileImage || "👤",
        email: u.email,
        profileImage: u.profileImage,
        status: onlineUsers.includes(u._id) ? "Online" : "Offline",
      }));
      setUsers(mappedUsers);
    }
  }, [userData, onlineUsers]);

  // Update messages when selectedUserData changes
  useEffect(() => {
    if (selectedUserData?.message) {
      setMessages(selectedUserData.message);

      const unseenIds = selectedUserData.message
        .filter((msg: ChatMessage) => !msg.seen && msg.receiverId === myId)
        .map((msg: ChatMessage) => msg._id!);

      if (unseenIds.length > 0) {
        markMessageAsSeen.mutate(unseenIds);
      }
    }
  }, [selectedUserData, myId]);

  // Socket for online users and new messages
  useSocket(
  (message: ChatMessage) => {
    // শুধুমাত্র অন্য কেউ পাঠালে (আমি নিজে না) তবেই যোগ করো
    if (message.senderId !== myId) {
      setMessages((prev) => [...prev, message]);

      // যদি আমার কাছে আসে এবং seen না থাকে
      if (message.receiverId === myId && !message.seen) {
        markMessageAsSeen.mutate([message._id!]);
      }
    }
  },
  (onlineIds) => setOnlineUsers(onlineIds)
);

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
          {!selectedUser ? (
            <EmptyState />
          ) : (
            <ChatArea
              selectedUser={selectedUser}
              messages={messages}
              myId={myId}
              onMessageSent={(msg) => setMessages((prev) => [...prev, msg])}
            />
          )}
        </div>

        {/* Profile Panel */}
        {selectedUser && <ProfilePanel selectedUser={selectedUser} />}
      </div>
    </div>
  );
};

export default QuickChat;