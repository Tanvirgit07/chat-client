/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/chat/ChatArea.tsx

"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Smile,
  ArrowLeft,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Reply,
  User,
} from "lucide-react";
import { User as UserType, ChatMessage } from "./QuickChat";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ChatAreaProps {
  selectedUser: UserType;
  messages: ChatMessage[];
  myId: string;
  onMessageSent?: (message: ChatMessage) => void;
  onBack?: () => void;
  onProfileClick?: () => void;
  messageActions?: {
    onEdit: (messageId: string, newText: string) => void;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
  };
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  messages,
  myId,
  onMessageSent,
  onBack,
  onProfileClick,
  messageActions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

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
    onSuccess: (res) => {
      const realMessage = res?.data as ChatMessage;
      if (realMessage?._id) onMessageSent?.(realMessage);
      resetInput();
    },
  });

  const resetInput = () => {
    setText("");
    setSelectedFiles([]);
    setReplyingTo(null);
    setEditingMessageId(null);
    setEditText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if (
      (!text.trim() && selectedFiles.length === 0) ||
      sendMessageMutation.isPending
    )
      return;

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const tempMessage: ChatMessage = {
      _id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      text: text || undefined,
      image: selectedFiles[0]
        ? URL.createObjectURL(selectedFiles[0])
        : undefined,
      createdAt: new Date().toISOString(),
      seen: false,
      edited: false,
      replyTo: replyingTo?._id || null,
      replyToText: replyingTo?.text || "",
      replyToImage: replyingTo?.image || undefined,
      replyToSenderName:
        replyingTo?.senderId === myId ? "You" : selectedUser.name,
    };

    onMessageSent?.(tempMessage);

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (selectedFiles[0]) formData.append("image", selectedFiles[0]);

    if (replyingTo) {
      if (replyingTo._id && !replyingTo._id.startsWith("temp_")) {
        formData.append("replyTo", replyingTo._id);
      }
      formData.append("replyToText", replyingTo.text || "");
      if (replyingTo.image) formData.append("replyToImage", replyingTo.image);
      formData.append(
        "replyToSenderName",
        replyingTo.senderId === myId ? "You" : selectedUser.name
      );
    }

    sendMessageMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!editText.trim() || !editingMessageId) return;
    messageActions?.onEdit(editingMessageId, editText.trim());
    resetInput();
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg._id!);
    setEditText(msg.text || "");
    setReplyingTo(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  const isDeletedForMe = (msg: ChatMessage) => msg.deletedBy?.includes(myId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900/30 h-full">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 pr-6 pl-4 py-3 lg:pr-0 lg:pl-0 lg:py-0 border">
        <div className="flex items-center gap-4 sm:p-4">
          <button onClick={onBack} className="lg:hidden text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg shadow-xl">
            {selectedUser.profileImage ? (
              <Image
                width={48}
                height={48}
                src={selectedUser.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white">
                {getInitials(selectedUser.name)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg truncate">
              {selectedUser.name}
            </h3>
            <p className="text-green-400 text-xs sm:text-sm">
              {selectedUser.status === "Online"
                ? "Online"
                : "Last seen recently"}
            </p>
          </div>
          <button onClick={onProfileClick} className="text-white">
            <User size={24} />
          </button>
        </div>
      </div>

      {/* Reply Preview - WhatsApp Style */}
      {replyingTo && (
        <div className="bg-gray-800/95 border-l-4 border-purple-500 px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Reply
              size={18}
              className="text-purple-400 flex-shrink-0 rotate-180"
            />
            <div className="min-w-0">
              <p className="text-purple-400 font-medium text-sm truncate">
                Replying to{" "}
                {replyingTo.senderId === myId ? "yourself" : selectedUser.name}
              </p>
              <p className="text-gray-300 text-xs truncate mt-0.5">
                {replyingTo.image ? "Photo" : replyingTo.text || "Message"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white ml-3 p-1 hover:bg-white/10 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto py-6 px-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 pt-32">
              <h3 className="text-2xl font-bold text-white mb-2">
                No messages yet!
              </h3>
              <p>Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === myId;
              const deleted = isDeletedForMe(msg);
              const isTemp = msg._id?.startsWith("temp_");

              return (
                <div
                  key={msg._id || Math.random()}
                  className={`flex items-end gap-3 group ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                  // Long Press for Reply (Mobile)
                  onTouchStart={() => {
                    if (deleted || isTemp) return;

                    const timeout = setTimeout(() => setReplyingTo(msg), 600);

                    const handleCancel = () => {
                      clearTimeout(timeout);
                      document.removeEventListener("touchend", handleCancel);
                      document.removeEventListener("touchmove", handleCancel);
                    };

                    document.addEventListener("touchend", handleCancel);
                    document.addEventListener("touchmove", handleCancel, {
                      passive: true,
                    });
                  }}
                  // Click for Reply (Desktop)
                  onClick={(e) => {
                    if (e.detail === 1 && !deleted && !isTemp) {
                      // Single click does nothing
                    }
                  }}
                >
                  <div className={`max-w-[75%] ${deleted ? "opacity-50" : ""}`}>
                    {/* Quoted Message */}
                    {msg.replyTo && !deleted && (
                      <div className="mb-3">
                        <div className="bg-gray-800/80 rounded-xl overflow-hidden border border-purple-500/30 shadow-md">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5">
                            <p className="text-xs font-bold text-white truncate">
                              {msg.replyToSenderName ||
                                (isMine ? "You" : selectedUser.name)}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-900/50">
                            {msg.replyToImage ? (
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                                  <Image
                                    src={msg.replyToImage}
                                    width={48}
                                    height={48}
                                    alt="replied"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-sm text-gray-400">
                                  Photo
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-300 line-clamp-2 break-all">
                                {msg.replyToText || "Message"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 shadow-xl transition-all ${
                        isMine
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none"
                          : "bg-gray-700/90 text-white rounded-tl-none"
                      }`}
                    >
                      {deleted ? (
                        <p className="italic text-gray-400 text-sm">
                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {msg.text && (
                            <p className="break-words text-base leading-relaxed">
                              {editingMessageId === msg._id ? (
                                <span className="opacity-80">{editText}</span>
                              ) : (
                                msg.text
                              )}
                              {msg.edited && (
                                <span className="text-xs opacity-70 ml-1">
                                  (edited)
                                </span>
                              )}
                            </p>
                          )}
                          {msg.image && (
                            <div className="mt-3 -mx-2">
                              <Image
                                src={msg.image}
                                width={380}
                                height={380}
                                alt="sent"
                                className="rounded-xl max-w-full border border-white/10 shadow-lg"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              <span
                                className={
                                  msg.seen ? "text-cyan-400" : "text-gray-400"
                                }
                              >
                                {msg.seen ? "Seen" : "Sent"}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* More Options Menu */}
                  {!deleted && !isTemp && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-8">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full shadow-lg"
                          >
                            <MoreVertical size={18} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-56 p-2 bg-gray-800 border border-purple-500/30 rounded-xl shadow-2xl"
                          align={isMine ? "end" : "start"}
                          sideOffset={10}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-white hover:bg-purple-600/50 rounded-lg"
                            onClick={() => setReplyingTo(msg)}
                          >
                            <Reply size={16} className="mr-3" /> Reply
                          </Button>
                          {isMine && msg.text && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-white hover:bg-purple-600/50 rounded-lg"
                              onClick={() => startEdit(msg)}
                            >
                              <Edit2 size={16} className="mr-3" /> Edit
                            </Button>
                          )}
                          {isMine && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-400 hover:bg-red-600/30 rounded-lg"
                              onClick={() =>
                                messageActions?.onDeleteForEveryone(msg._id!)
                              }
                            >
                              <Users size={16} className="mr-3" /> Delete for
                              Everyone
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:bg-red-600/30 rounded-lg border-t border-white/10 mt-1 pt-2"
                            onClick={() =>
                              messageActions?.onDeleteForMe(msg._id!)
                            }
                          >
                            <Trash2 size={16} className="mr-3" /> Delete for Me
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-black/50 backdrop-blur-xl border-t border-purple-500/20 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {selectedFiles.length > 0 && (
            <div className="relative inline-block animate-in fade-in duration-300">
              <Image
                src={URL.createObjectURL(selectedFiles[0])}
                width={400}
                height={400}
                alt="preview"
                className="rounded-xl max-h-64 object-cover border border-purple-500/50 shadow-2xl"
              />
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-black/80 p-2 rounded-full hover:bg-black transition"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center lg:gap-4 md:gap-3 gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && setSelectedFiles([e.target.files[0]])
              }
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-purple-400 transition mb-1"
            >
              <ImageIcon size={24} />
            </button>

            <button
              onClick={() => setShowEmoji((p) => !p)}
              className="text-gray-400 hover:text-yellow-400 transition mb-1"
            >
              <Smile size={24} />
            </button>

            {showEmoji && (
              <div className="absolute bottom-20 left-4 z-50">
                <EmojiPicker
                  onEmojiClick={(e) => {
                    const emoji = e.emoji;
                    if (editingMessageId) {
                      setEditText((t) => t + emoji);
                    } else {
                      setText((t) => t + emoji);
                    }
                    inputRef.current?.focus();
                  }}
                  theme={Theme.DARK}
                  lazyLoadEmojis={true}
                />
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={editingMessageId ? editText : text}
              onChange={(e) =>
                editingMessageId
                  ? setEditText(e.target.value)
                  : setText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  editingMessageId ? handleEdit() : handleSend();
                }
                if (e.key === "Escape") resetInput();
              }}
              placeholder={
                editingMessageId
                  ? "Edit message..."
                  : replyingTo
                  ? "Write a reply..."
                  : "Type a message..."
              }
              className="flex-1 bg-white/10 rounded-full py-3.5 px-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />

            <button
              onClick={editingMessageId ? handleEdit : handleSend}
              disabled={
                sendMessageMutation.isPending ||
                (!text.trim() &&
                  selectedFiles.length === 0 &&
                  !editingMessageId)
              }
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-full p-3.5 shadow-xl transition transform hover:scale-110 active:scale-95 mb-1"
            >
              {editingMessageId ? <Edit2 size={22} /> : <Send size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
