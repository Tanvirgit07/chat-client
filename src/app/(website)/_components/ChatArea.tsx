/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Smile,
  ArrowLeft,
  User as UserIcon,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import { User, ChatMessage } from "./QuickChat";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface ChatAreaProps {
  selectedUser: User;
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
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleSend = () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage: ChatMessage = {
      _id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      text: text || undefined,
      image: selectedFiles[0] ? URL.createObjectURL(selectedFiles[0]) : undefined,
      createdAt: new Date().toISOString(),
      seen: false,
    };

    onMessageSent?.(tempMessage);

    const formData = new FormData();
    formData.append("text", text);
    selectedFiles.forEach((file) => formData.append("image", file));

    sendMessageMutation.mutate(formData, {
      onSuccess: (res) => {
        const realMessage = res?.data as ChatMessage;
        if (realMessage?._id) {
          onMessageSent?.(realMessage);
        }
        setText("");
        setSelectedFiles([]);
      },
    });
  };

  const handleEdit = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditText(currentText);
    setOpenMenuId(null); // মেনু বন্ধ
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingMessageId) return;
    messageActions?.onEdit(editingMessageId, editText);
    setEditingMessageId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const removeImage = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiData: any) => {
    if (editingMessageId) {
      setEditText((prev) => prev + emojiData.emoji);
    } else {
      setText((prev) => prev + emojiData.emoji);
    }
  };

  // Three dot মেনু টগল করা
  const toggleMenu = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === messageId ? null : messageId));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // বাইরে ক্লিক করলে মেনু বন্ধ
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".message-menu")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]?.toUpperCase()).slice(0, 2).join("");
  };

  const isDeletedForMe = (msg: ChatMessage) => msg.deletedBy?.includes(myId);

  return (
    <div className="flex-1 flex flex-col bg-gray-900/30 h-full relative">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 p-3 sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onBack} className="lg:hidden text-white hover:text-purple-400 transition">
            <ArrowLeft size={24} />
          </button>

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg sm:text-xl shadow-xl flex-shrink-0">
            {selectedUser.profileImage ? (
              <Image width={48} height={48} src={selectedUser.profileImage} alt={selectedUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white">{getInitials(selectedUser.name)}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base sm:text-lg truncate">{selectedUser.name}</h3>
            <p className="text-green-400 text-xs sm:text-sm font-medium">
              {selectedUser.status === "Online" ? "Online" : "Offline"}
            </p>
          </div>

          <button onClick={onProfileClick} className="xl:hidden text-white hover:text-purple-400 transition">
            <UserIcon size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto py-4 sm:py-10 px-3 sm:px-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center pt-10 sm:pt-20 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No messages yet!</h3>
              <p className="text-gray-400 text-sm">Start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {messages.map((msg, index) => {
                const isMine = msg.senderId === myId;
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const showAvatar = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId);
                const deletedForMe = isDeletedForMe(msg);

                if (msg._id === "being-deleted") return null;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex items-end gap-2 sm:gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isMine && showAvatar && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm sm:text-base font-bold shadow-xl flex-shrink-0">
                        {selectedUser.profileImage ? (
                          <Image width={32} height={32} src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs sm:text-sm">{getInitials(selectedUser.name)}</span>
                        )}
                      </div>
                    )}
                    {!isMine && !showAvatar && <div className="w-6 sm:w-8" />}

                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-xl transition-all ${
                          isMine
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none"
                            : "bg-gray-700/90 text-white rounded-tl-none backdrop-blur-sm border border-white/5"
                        } ${deletedForMe ? "opacity-50" : ""}`}
                      >
                        {editingMessageId === msg._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="flex-1 bg-white/20 rounded px-3 py-1.5 text-white placeholder-gray-300 text-sm"
                              autoFocus
                            />
                            <button onClick={saveEdit} className="text-green-400"><Send size={18} /></button>
                            <button onClick={cancelEdit} className="text-red-400"><X size={18} /></button>
                          </div>
                        ) : deletedForMe ? (
                          <p className="text-gray-500 italic text-sm">This message was deleted</p>
                        ) : (
                          <>
                            {msg.text && (
                              <p className="text-sm sm:text-base leading-relaxed break-words">
                                {msg.text}
                                {msg.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}
                              </p>
                            )}
                            {msg.image && (
                              <div className="mt-2 sm:mt-3 -mx-1 sm:-mx-2">
                                <Image
                                  width={380}
                                  height={380}
                                  src={msg.image}
                                  alt="sent"
                                  className="rounded-xl max-w-full shadow-lg border border-white/10"
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1 sm:mt-2">
                              <span className="text-[10px] sm:text-xs opacity-70">{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                <span className={`text-[10px] sm:text-xs font-bold ${msg.seen ? "text-cyan-400" : "text-gray-400"}`}>
                                  {msg.seen ? "Seen" : "Sent"}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Three Dot Menu */}
                      {!deletedForMe && (
                        <div className="message-menu relative">
                          <button
                            onClick={(e) => toggleMenu(e, msg._id!)}
                            className="text-white/60 hover:text-white transition p-1 rounded-full hover:bg-white/10"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Menu Dropdown */}
                          {openMenuId === msg._id && (
                            <div
                              className="message-menu absolute bottom-10 -right-2 bg-gray-800 border border-purple-500/30 rounded-lg shadow-2xl py-2 min-w-48 z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isMine && (
                                <>
                                  <button
                                    onClick={() => handleEdit(msg._id!, msg.text || "")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-purple-600/50 flex items-center gap-3 transition"
                                  >
                                    <Edit2 size={16} /> Edit Message
                                  </button>
                                  <button
                                    onClick={() => {
                                      messageActions?.onDeleteForEveryone(msg._id!);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-600/30 flex items-center gap-3 transition"
                                  >
                                    <Users size={16} /> Delete for Everyone
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  messageActions?.onDeleteForMe(msg._id!);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-600/30 flex items-center gap-3 transition border-t border-white/10 mt-1"
                              >
                                <Trash2 size={16} /> Delete for Me
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-black/40 backdrop-blur-xl border-t border-purple-500/20 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
          {selectedFiles.length > 0 && (
            <div className="relative inline-block max-w-xs">
              <Image
                width={400}
                height={400}
                src={URL.createObjectURL(selectedFiles[0])}
                alt="Preview"
                className="rounded-xl max-w-full max-h-48 sm:max-h-60 object-cover shadow-2xl border border-purple-500/30"
              />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 relative">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-purple-400 transition flex-shrink-0">
              <ImageIcon size={22} className="sm:w-6 sm:h-6" />
            </button>

            <button onClick={() => setShowEmoji((prev) => !prev)} className="text-gray-400 hover:text-yellow-400 transition flex-shrink-0">
              <Smile size={22} className="sm:w-6 sm:h-6" />
            </button>

            {showEmoji && (
              <div className="absolute bottom-14 sm:bottom-16 left-0 sm:left-12 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} width={280} height={350} />
              </div>
            )}

            <input
              type="text"
              value={editingMessageId ? editText : text}
              onChange={(e) => {
                if (editingMessageId) setEditText(e.target.value);
                else setText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  editingMessageId ? saveEdit() : handleSend();
                }
                if (e.key === "Escape" && editingMessageId) cancelEdit();
              }}
              placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
              className="flex-1 bg-white/10 backdrop-blur-md text-white placeholder-gray-400 rounded-full py-2.5 sm:py-3.5 px-4 sm:px-6 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            />

            <button
              onClick={editingMessageId ? saveEdit : handleSend}
              disabled={sendMessageMutation.isPending || (!text.trim() && selectedFiles.length === 0 && !editingMessageId)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-full p-2.5 sm:p-3.5 shadow-xl transition transform hover:scale-110 active:scale-95 flex-shrink-0"
            >
              <Send size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;