/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/chat/QuickChat.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import EmptyState from "./EmptyState";
import ChatArea from "./ChatArea";
import ProfilePanel from "./ProfilePanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSocket from "@/lib/socketIoConnection";
import { X } from "lucide-react";

export interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  email?: string;
  profileImage?: string;
}

// QuickChat.tsx → এই interface টা পুরোটা রিপ্লেস করো

// QuickChat.tsx → এই interface টা পুরোটা রিপ্লেস করো
export interface ChatMessage {
  _id?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string | null;
  voice?: string | null;                    // আগেও ছিল
  voiceDuration?: number;
  messageType?: "text" | "image" | "voice";
  createdAt: string;
  updatedAt?: string;
  seen?: boolean;
  edited?: boolean;
  deletedBy?: string[];

  // Reply related fields
  replyTo?: string | null;
  replyToText?: string;
  replyToImage?: string | null;
  replyToVoice?: string | null;              // ← এটা যোগ করো (যাতে voice reply preview আসে)
  replyToSenderName?: string;
}

const QuickChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sharedMedia, setSharedMedia] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  const { data: session, status } = useSession();
  // const queryClient = useQueryClient();

  const user = session?.user as any;
  const myId = user?._id || user?.id || "";
  const TOKEN = user?.accessToken;

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    enabled: status === "authenticated" && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/sidebar-user`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: selectedUserData } = useQuery({
    queryKey: ["selectedUserData", selectedUser?.id],
    enabled: !!selectedUser && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/selected-user/${selectedUser?.id}`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const markMessageAsSeen = useMutation({
    mutationFn: async (messageIds: string[]) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/markmessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ messageIds }),
      });
    },
  });

  // Edit Mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, newText }: { messageId: string; newText: string }) => {
      const formData = new FormData();
      formData.append("newText", newText);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/edit-message/${messageId}`, {
        method: "POST",
        headers: { authorization: `Bearer ${TOKEN}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Delete For Me
  const deleteForMeMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/delete-message/${messageId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${TOKEN}` },
      });
    },
  });

  // Delete For Everyone
  const deleteForEveryoneMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/delete-message-everyone/${messageId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${TOKEN}` },
      });
    },
  });

  // Socket Listeners
  useSocket(
    useCallback((message: ChatMessage) => {
      if (
        (message.senderId === selectedUser?.id && message.receiverId === myId) ||
        (message.senderId === myId && message.receiverId === selectedUser?.id)
      ) {
        setMessages(prev => [...prev, message]);
        if (message.image) setSharedMedia(prev => [message.image!, ...prev]);
        if (message.senderId === selectedUser?.id && message._id) {
          markMessageAsSeen.mutate([message._id]);
        }
      }
    }, [selectedUser?.id, myId]),

    useCallback((onlineIds: string[]) => setOnlineUsers(onlineIds), []),

    useCallback((editedMessage: ChatMessage) => {
      setMessages(prev =>
        prev.map(m => m._id === editedMessage._id ? { ...editedMessage, edited: true } : m)
      );
    }, []),

    useCallback((data: any) => {
      if (data.deletedForEveryone) {
        setMessages(prev => prev.filter(m => m._id !== data.messageId));
      } else if (data.deletedFor?.includes(myId)) {
        setMessages(prev =>
          prev.map(m =>
            m._id === data.messageId
              ? { ...m, deletedBy: [...(m.deletedBy || []), myId] }
              : m
          )
        );
      }
    }, [myId])
  );

  // Users & Messages Update
  useEffect(() => {
    if (userData?.users) {
      const mapped = userData.users.map((u: any) => ({
        id: u._id,
        name: u.fullName,
        profileImage: u.profileImage,
        status: onlineUsers.includes(u._id) ? "Online" : "Offline",
      }));
      setUsers(mapped);
    }
  }, [userData, onlineUsers]);

  useEffect(() => {
    if (selectedUserData?.message) {
      setMessages(selectedUserData.message);
      const images = selectedUserData.message
        .filter((m: any) => m.image)
        .map((m: any) => m.image)
        .reverse();
      setSharedMedia(images);

      const unseen = selectedUserData.message
        .filter((m: any) => !m.seen && m.receiverId === myId)
        .map((m: any) => m._id)
        .filter(Boolean);
      if (unseen.length > 0) markMessageAsSeen.mutate(unseen);
    }
  }, [selectedUserData, myId]);

  const handleNewMessage = (message: ChatMessage) => {
  const isTemp = (id: string | undefined) => id?.startsWith("temp_");

  setMessages((prev) => {
    const exists = prev.some((m) => m._id === message._id);
    if (exists) {
      return prev.map((m) => (m._id === message._id ? message : m));
    }
    if (isTemp(message._id)) {
      return [...prev, message];
    }
    // Replace temp message with real one
    return prev.map((m) => (isTemp(m._id) && m.text === message.text && m.image === message.image ? message : m));
  });
};

  const messageActions = {
    onEdit: (id: string, text: string) => editMessageMutation.mutate({ messageId: id, newText: text }),
    onDeleteForMe: (id: string) => deleteForMeMutation.mutate(id),
    onDeleteForEveryone: (id: string) => {
      setMessages(prev => prev.map(m => m._id === id ? { ...m, _id: "being-deleted" } : m));
      deleteForEveryoneMutation.mutate(id);
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 lg:p-2">
      <div className="flex w-full max-w-7xl lg:h-[90vh] h-screen lg:rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
        <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-96`}>
          <Sidebar users={users} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        </div>

        <div className={`${selectedUser ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
          {!selectedUser ? (
            <EmptyState />
          ) : (
            <ChatArea
              selectedUser={selectedUser}
              messages={messages}
              myId={myId}
              onMessageSent={handleNewMessage}
              onBack={() => setSelectedUser(null)}
              onProfileClick={() => setShowProfile(true)}
              messageActions={messageActions}
            />
          )}
        </div>

        {selectedUser && (
          <>
            <div className="hidden xl:block w-96">
              <ProfilePanel selectedUser={selectedUser} sharedMedia={sharedMedia} />
            </div>
            {showProfile && (
              <div className="fixed inset-0 z-50 xl:hidden bg-black/60" onClick={() => setShowProfile(false)}>
                <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-gray-900" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowProfile(false)} className="absolute top-4 left-4 z-10 bg-black/70 p-2 rounded-full">
                    <X size={24} />
                  </button>
                  <ProfilePanel selectedUser={selectedUser} sharedMedia={sharedMedia} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuickChat;