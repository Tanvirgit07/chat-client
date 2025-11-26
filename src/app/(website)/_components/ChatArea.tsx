/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Image as ImageIcon, Info } from "lucide-react";
import { User, ChatMessage } from "./QuickChat";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ChatAreaProps {
  selectedUser: User;
  messages: ChatMessage[];
  myId: string;
  onMessageSent?: (message: ChatMessage) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  messages,
  myId,
  onMessageSent,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: session } = useSession();
  const TOKEN = (session?.user as any)?.accessToken;

  const sendMessageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/message/send-message/${selectedUser.id}`,
        {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.data) {
        // রিয়েল মেসেজ দিয়ে টেম্প মেসেজ রিপ্লেস করো
        onMessageSent?.(data.data);
      }
    },
  });

  const handleSend = () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    const tempId = "temp-" + Date.now();
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      text: text || undefined,
      image: selectedFiles[0] ? URL.createObjectURL(selectedFiles[0]) : undefined,
      createdAt: new Date().toISOString(),
      seen: true,
    };

    // ইনস্ট্যান্ট দেখাও (সেন্ডারের জন্য)
    onMessageSent?.(optimisticMessage);

    const formData = new FormData();
    formData.append("text", text);
    selectedFiles.forEach((file) => formData.append("image", file));

    sendMessageMutation.mutate(formData, {
      onSuccess: (res) => {
        const realMsg = res.data;
        // টেম্প মেসেজ রিপ্লেস করো
        onMessageSent?.(realMsg);
        setText("");
        setSelectedFiles([]);
      },
      onError: () => {
        // এরর হলে টেম্প মেসেজ মুছে ফেলো (অপশনাল)
        // setMessages(prev => prev.filter(m => m._id !== tempId));
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {selectedUser.profileImage ? (
              <Image width={40} height={40} src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xl">
                {selectedUser.avatar}
              </div>
            )}
          </div>
          <h3 className="text-white font-semibold">{selectedUser.name}</h3>
        </div>
        <Info className="text-gray-400" size={20} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === myId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 break-words ${
                  msg.senderId === myId
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.image && (
                  <Image
                    width={300}
                    height={300}
                    src={msg.image}
                    alt="sent"
                    className="mt-2 rounded max-w-full"
                  />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white"
          >
            <ImageIcon size={22} />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type a message..."
            className="flex-1 bg-purple-900/30 text-white placeholder-gray-500 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={sendMessageMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;