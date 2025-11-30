/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/chat/QuickChat.tsx
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import EmptyState from "./EmptyState";
import ChatArea from "./ChatArea";
import ProfilePanel from "./ProfilePanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSocket from "@/lib/socketIoConnection";
import { X } from "lucide-react";
import IncomingCallModal from "@/components/Dialog/IncomingCallModal";
import { User, ChatMessage } from "@/type";

const QuickChat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sharedMedia, setSharedMedia] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
  callerId: string;
  callerName: string;
  callerImage?: string;
  roomName: string;
  isVideo: boolean;
} | null>(null);
const [callData, setCallData] = useState<{
  roomName: string;
  token: string;
  isVideo: boolean;
} | null>(null);

  const { data: session, status } = useSession();
  // const queryClient = useQueryClient();

  const user = session?.user as any;
  const myId = user?._id || user?.id || "";
  const TOKEN = user?.accessToken;

  const { data: userData } = useQuery({
    queryKey: ["userData"],
    enabled: status === "authenticated" && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/sidebar-user`,
        {
          headers: { authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: selectedUserData } = useQuery({
    queryKey: ["selectedUserData", selectedUser?.id],
    enabled: !!selectedUser && !!TOKEN,
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/selected-user/${selectedUser?.id}`,
        {
          headers: { authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const markMessageAsSeen = useMutation({
    mutationFn: async (messageIds: string[]) => {
      await fetch(
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
    },
  });

  // Edit Mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      newText,
    }: {
      messageId: string;
      newText: string;
    }) => {
      const formData = new FormData();
      formData.append("newText", newText);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/edit-message/${messageId}`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${TOKEN}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Delete For Me
  const deleteForMeMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/delete-message/${messageId}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${TOKEN}` },
        }
      );
    },
  });

  // Delete For Everyone
  const deleteForEveryoneMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/delete-message-everyone/${messageId}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${TOKEN}` },
        }
      );
    },
  });

 
const socket = useSocket(
  (message: ChatMessage) => {
    if (
      (message.senderId === selectedUser?.id && message.receiverId === myId) ||
      (message.senderId === myId && message.receiverId === selectedUser?.id)
    ) {
      handleNewMessage(message);
    }
  },
  (onlineIds: string[]) => setOnlineUsers(onlineIds),
  (editedMessage: ChatMessage) => {
    setMessages(prev =>
      prev.map(m => m._id === editedMessage._id ? { ...editedMessage, edited: true } : m)
    );
  },
  (data: any) => {
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
  },
  // Incoming Call Listener ← এটা এখন কাজ করবে!
  (data: any) => {
    const caller = users.find(u => u.id === data.callerId);
    setIncomingCall({
      callerId: data.callerId,
      callerName: caller?.name || "Unknown",
      callerImage: caller?.profileImage,
      roomName: data.roomName,
      isVideo: data.isVideo,
    });
  }
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
      return prev.map((m) =>
        isTemp(m._id) && m.text === message.text && m.image === message.image
          ? message
          : m
      );
    });
  };

  const messageActions = {
    onEdit: (id: string, text: string) =>
      editMessageMutation.mutate({ messageId: id, newText: text }),

    onDeleteForMe: (id: string) => {
      deleteForMeMutation.mutate(id);
    },

    onDeleteForEveryone: (id: string) => {
      // এটাই ম্যাজিক লাইন — sender এর কাছেও ইনস্ট্যান্ট মুছে যাবে
      setMessages((prev) => prev.filter((m) => m._id !== id));

      // temp message হলে শুধু UI থেকে মুছে দিব, API কল লাগবে না
      if (id.startsWith("temp_")) return;

      // আসল মেসেজ হলে তবেই API কল
      deleteForEveryoneMutation.mutate(id);
    },
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 lg:p-2">
      <div className="flex w-full max-w-7xl lg:h-[90vh] h-screen lg:rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
        <div
          className={`${
            selectedUser ? "hidden lg:flex" : "flex"
          } w-full lg:w-96`}
        >
          <Sidebar
            users={users}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        </div>

        <div
          className={`${
            selectedUser ? "flex" : "hidden lg:flex"
          } flex-1 flex-col`}
        >
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
  socket={socket}
  // এই দুইটা লাইন যোগ করো
  callData={callData}
  setCallData={setCallData}
/>
          )}
        </div>

        {selectedUser && (
          <>
            <div className="hidden xl:block w-96">
              <ProfilePanel
                selectedUser={selectedUser}
                sharedMedia={sharedMedia}
              />
            </div>
            {showProfile && (
              <div
                className="fixed inset-0 z-50 xl:hidden bg-black/60"
                onClick={() => setShowProfile(false)}
              >
                <div
                  className="absolute right-0 top-0 h-full w-full sm:w-96 bg-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowProfile(false)}
                    className="absolute top-4 left-4 z-10 bg-black/70 p-2 rounded-full"
                  >
                    <X size={24} />
                  </button>
                  <ProfilePanel
                    selectedUser={selectedUser}
                    sharedMedia={sharedMedia}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Incoming Call Modal - সবার শেষে */}
    {incomingCall && (
      <IncomingCallModal
        callerName={incomingCall.callerName}
        callerImage={incomingCall.callerImage}
        isVideo={incomingCall.isVideo}
        onAccept={() => {
          socket?.emit("call-accept", {
            callerId: incomingCall.callerId,
            roomName: incomingCall.roomName,
          });
          setCallData({
            roomName: incomingCall.roomName,
            token: "accepted",
            isVideo: incomingCall.isVideo,
          });
          setIncomingCall(null);
        }}
        onReject={() => {
          socket?.emit("call-reject", { callerId: incomingCall.callerId });
          setIncomingCall(null);
        }}
      />
    )}
    </div>
  );
};

export default QuickChat;
