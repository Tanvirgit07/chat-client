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
  const [sharedMedia, setSharedMedia] = useState<string[]>([]); // নতুন

  const { data: session, status } = useSession();

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
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

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
      if (!res.ok) throw new Error("Failed to mark as seen");
      return res.json();
    },
  });

  useEffect(() => {
    if (userData?.users) {
      const mappedUsers: User[] = userData.users.map((u: any) => ({
        id: u._id,
        name: u.fullName,
        avatar: u.profileImage || "U",
        email: u.email,
        profileImage: u.profileImage,
        status: onlineUsers.includes(u._id) ? "Online" : "Offline",
      }));
      setUsers(mappedUsers);
    }
  }, [userData, onlineUsers]);

  useEffect(() => {
    if (selectedUserData?.message) {
      const msgs: ChatMessage[] = selectedUserData.message;
      setMessages(msgs);

      const images = msgs
        .filter((msg) => msg.image)
        .map((msg) => msg.image!)
        .reverse();
      setSharedMedia(images);

      const unseenIds = msgs
        .filter((msg: ChatMessage) => !msg.seen && msg.receiverId === myId)
        .map((msg: ChatMessage) => msg._id!)
        .filter(Boolean);

      if (unseenIds.length > 0) {
        markMessageAsSeen.mutate(unseenIds);
      }
    }
  }, [selectedUserData, myId]);

  useSocket(
    (message: ChatMessage) => {
      if (message.senderId !== myId) {
        setMessages((prev) => [...prev, message]);
        if (message.image) {
          setSharedMedia((prev) => [message.image!, ...prev]);
        }
        if (!message.seen && message._id) {
          markMessageAsSeen.mutate([message._id]);
        }
      }
    },
    (onlineIds) => setOnlineUsers(onlineIds)
  );

  const handleNewMessage = (message: ChatMessage) => {
    const isTemp = typeof message._id === "string" && message._id.startsWith("temp_");

    if (isTemp) {
      setMessages((prev) => [...prev, message]);
      if (message.image) {
        setSharedMedia((prev) => [message.image!, ...prev]);
      }
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          typeof msg._id === "string" && msg._id.startsWith("temp_") ? message : msg
        )
      );
      if (message.image) {
        setSharedMedia((prev) => {
          const filtered = prev.filter((url) => !url.startsWith("blob:"));
          return [message.image!, ...filtered];
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-900">
      <div className="flex w-[80%] max-w-7xl h-[85vh] shadow-2xl rounded-2xl overflow-hidden border border-purple-500/20">
        <Sidebar users={users} selectedUser={selectedUser} onSelectUser={setSelectedUser} />

        <div className="flex-1 flex">
          {!selectedUser ? (
            <EmptyState />
          ) : (
            <ChatArea
              selectedUser={selectedUser}
              messages={messages}
              myId={myId}
              onMessageSent={handleNewMessage}
            />
          )}
        </div>

        {selectedUser && (
          <ProfilePanel selectedUser={selectedUser} sharedMedia={sharedMedia} />
        )}
      </div>
    </div>
  );
};

export default QuickChat;