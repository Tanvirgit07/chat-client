/* eslint-disable @typescript-eslint/no-explicit-any */
// ChatArea.tsx → এই ফাইলটা পুরোটা রিপ্লেস করো (শুধু voice message এর bug fix)
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
  Mic,
  Volume2,
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

  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    setRecordedBlob(null);
    setIsRecording(false);
    setRecordDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      setIsRecording(true);
      setRecordedBlob(null);
      chunksRef.current = [];
    } catch (err) {
        console.error("please wait recording on:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setRecordedBlob(blob);
      setIsRecording(false);
    };
  };

  // এই ফাংশনটা সবচেয়ে গুরুত্বপূর্ণ — এটাই ঠিক করা হয়েছে
  const sendVoiceMessage = () => {
    if (!recordedBlob || sendMessageMutation.isPending) return;

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Temp message for instant UI
    const tempMessage: ChatMessage = {
      _id: tempId,
      senderId: myId,
      receiverId: selectedUser.id,
      messageType: "voice",
      voice: URL.createObjectURL(recordedBlob),
      voiceDuration: recordDuration,
      createdAt: new Date().toISOString(),
      seen: false,
      replyTo: replyingTo?._id || null,
      replyToText: replyingTo?.text || "",
      replyToImage: replyingTo?.image || undefined,
      replyToVoice: replyingTo?.voice || undefined,
      replyToSenderName:
        replyingTo?.senderId === myId ? "You" : selectedUser.name,
    };

    onMessageSent?.(tempMessage);

    const formData = new FormData();
    formData.append("voice", recordedBlob, "voice.webm"); // এই লাইনটা সবচেয়ে জরুরি
    formData.append("messageType", "voice"); // এটাও দরকার (যদিও backend এ detect করে)
    formData.append("voiceDuration", recordDuration.toString());

    if (replyingTo) {
      if (replyingTo._id && !replyingTo._id.startsWith("temp_")) {
        formData.append("replyTo", replyingTo._id);
      }
      formData.append("replyToText", replyingTo.text || "");
      if (replyingTo.image) formData.append("replyToImage", replyingTo.image);
      if (replyingTo.voice) formData.append("replyToVoice", replyingTo.voice);
      formData.append(
        "replyToSenderName",
        replyingTo.senderId === myId ? "You" : selectedUser.name
      );
    }

    sendMessageMutation.mutate(formData);
  };

  const cancelVoice = () => {
    setRecordedBlob(null);
    chunksRef.current = [];
    setRecordDuration(0);
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
      messageType: selectedFiles.length > 0 ? "image" : "text",
      text: text || undefined,
      image: selectedFiles[0]
        ? URL.createObjectURL(selectedFiles[0])
        : undefined,
      createdAt: new Date().toISOString(),
      seen: false,
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
      if (replyingTo._id && !replyingTo._id.startsWith("temp_"))
        formData.append("replyTo", replyingTo._id);
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
    if (msg.messageType !== "text") return;
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
    <div className="flex flex-col h-full bg-gray-900/30">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 z-10">
        <div className="flex items-center justify-between px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="lg:hidden text-white flex-shrink-0"
            >
              <ArrowLeft size={26} />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0">
              {selectedUser.profileImage ? (
                <Image
                  width={40}
                  height={40}
                  src={selectedUser.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg flex items-center justify-center w-full h-full">
                  {getInitials(selectedUser.name)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-medium text-base truncate">
                {selectedUser.name}
              </h3>
              <p className="text-green-400 text-xs">
                {selectedUser.status === "Online"
                  ? "Online"
                  : "Last seen recently"}
              </p>
            </div>
          </div>
          <button onClick={onProfileClick} className="text-white ml-2">
            <User size={26} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-4 space-y-3 max-w-4xl mx-auto w-full">
          {messages.map((msg) => {
            const isMine = msg.senderId === myId;
            const deleted = isDeletedForMe(msg);
            const isTemp = msg._id?.startsWith("temp_");

            return (
              <div
                key={msg._id || Math.random()}
                className={`flex items-end gap-2 ${
                  isMine ? "flex-row-reverse" : "flex-row"
                } group`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] ${
                    deleted ? "opacity-50" : ""
                  }`}
                >
                  {msg.replyTo && !deleted && (
                    <div className="mb-2">
                      <div className="bg-gray-800/90 rounded-lg overflow-hidden border border-purple-500/30">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1">
                          <p className="text-xs font-bold text-white truncate">
                            {msg.replyToSenderName ||
                              (isMine ? "You" : selectedUser.name)}
                          </p>
                        </div>
                        <div className="p-2 bg-gray-900/70">
                          {msg.replyToVoice ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Volume2 size={14} />
                              <span>Voice message</span>
                            </div>
                          ) : msg.replyToImage ? (
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded overflow-hidden bg-gray-700">
                                <Image
                                  src={msg.replyToImage}
                                  width={40}
                                  height={40}
                                  alt=""
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-xs text-gray-400">
                                Photo
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-300 line-clamp-2">
                              {msg.replyToText || "Message"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3 py-2 shadow-lg ${
                      isMine
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none"
                        : "bg-gray-700/90 text-white rounded-tl-none"
                    }`}
                  >
                    {deleted ? (
                      <p className="italic text-gray-400 text-sm">
                        This message was deleted
                      </p>
                    ) : msg.messageType === "voice" && msg.voice ? (
                      <div className="flex items-center gap-3 py-2">
                        <button
                          onClick={() => {
                            if (msg.voice) {
                              new Audio(msg.voice).play();
                            }
                          }}
                          className="flex items-center gap-3"
                        >
                          <div className="bg-white/20 rounded-full p-3">
                            <Volume2 size={28} className="text-white" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm">Voice message</p>
                            <p className="text-xs opacity-70">
                              {msg.voiceDuration
                                ? `${Math.floor(
                                    msg.voiceDuration / 60
                                  )}:${String(msg.voiceDuration % 60).padStart(
                                    2,
                                    "0"
                                  )}`
                                : "0:05"}
                            </p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <>
                        {msg.text && (
                          <p className="text-sm sm:text-base leading-relaxed break-words">
                            {editingMessageId === msg._id ? editText : msg.text}
                            {msg.edited && (
                              <span className="text-xs opacity-70 ml-1">
                                (edited)
                              </span>
                            )}
                          </p>
                        )}
                        {msg.image && (
                          <div className="mt-2 -mx-1">
                            <Image
                              src={msg.image}
                              width={300}
                              height={300}
                              alt="sent"
                              className="rounded-lg max-w-full border border-white/10"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1 text-xs opacity-70">
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

                {/* More Options */}
                {!deleted && !isTemp && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-6">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white/60 hover:text-white h-8 w-8"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-1 bg-gray-800 border-purple-500/30">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setReplyingTo(msg)}
                        >
                          <Reply size={14} className="mr-2" /> Reply
                        </Button>
                        {isMine && msg.messageType === "text" && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => startEdit(msg)}
                          >
                            <Edit2 size={14} className="mr-2" /> Edit
                          </Button>
                        )}
                        {isMine && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-400"
                              onClick={() =>
                                messageActions?.onDeleteForEveryone(msg._id!)
                              }
                            >
                              <Users size={14} className="mr-2" /> Delete for
                              Everyone
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-400 border-t"
                              onClick={() =>
                                messageActions?.onDeleteForMe(msg._id!)
                              }
                            >
                              <Trash2 size={14} className="mr-2" /> Delete for
                              Me
                            </Button>
                          </>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-black/50 backdrop-blur-xl border-t border-purple-500/20 p-3 pb-safe-offset-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="bg-gray-800/95 border-l-4 border-purple-500 rounded-r-lg px-4 py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Reply
                  size={16}
                  className="text-purple-400 flex-shrink-0 rotate-180"
                />
                <div className="min-w-0">
                  <p className="text-purple-400 font-medium truncate">
                    Replying to{" "}
                    {replyingTo.senderId === myId
                      ? "yourself"
                      : selectedUser.name}
                  </p>
                  <p className="text-gray-300 text-xs truncate">
                    {replyingTo.voice
                      ? "Voice message"
                      : replyingTo.image
                      ? "Photo"
                      : replyingTo.text || "Message"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Voice Recorded Preview */}
          {recordedBlob && (
            <div className="flex items-center gap-3 bg-gray-800/90 rounded-full px-5 py-3">
              <button onClick={cancelVoice} className="text-red-400">
                <X size={24} />
              </button>
              <span className="text-white text-sm">
                Voice recorded • {recordDuration}s
              </span>
              <button onClick={sendVoiceMessage} className="text-green-400">
                <Send size={24} />
              </button>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-3 bg-red-600/30 rounded-full px-4 py-3 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <span className="text-red-400 font-medium">
                {String(Math.floor(recordDuration / 60)).padStart(2, "0")}:
                {String(recordDuration % 60).padStart(2, "0")}
              </span>
              <span className="text-gray-300 text-xs">← Slide to cancel</span>
            </div>
          )}

          {/* Image Preview */}
          {selectedFiles.length > 0 && (
            <div className="relative inline-block">
              <Image
                src={URL.createObjectURL(selectedFiles[0])}
                width={400}
                height={400}
                alt="Preview"
                className="rounded-lg max-h-64 w-auto object-cover border border-purple-500/50"
              />
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-black/80 p-2 rounded-full"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-3">
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full p-3 shadow-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            >
              <ImageIcon size={21} className="text-white" />
            </button>

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowEmoji((p) => !p)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full p-3 shadow-xl transition-all hover:scale-110 active:scale-95"
              >
                <Smile size={21} className="text-white" />
              </button>
              {showEmoji && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 sm:left-auto sm:translate-x-0">
                  <div className="relative">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        const emoji = e.emoji;
                        if (editingMessageId) setEditText((t) => t + emoji);
                        else setText((t) => t + emoji);
                        inputRef.current?.focus();
                      }}
                      theme={Theme.DARK}
                      height={360}
                      width={320}
                      lazyLoadEmojis={true}
                    />
                    <button
                      onClick={() => setShowEmoji(false)}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/95 text-white px-4 py-1.5 rounded-t-xl text-sm font-medium shadow-2xl sm:hidden"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mic Button */}
            {!editingMessageId && !recordedBlob && (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                } rounded-full p-3.5 shadow-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0`}
              >
                <Mic size={24} className="text-white" />
              </button>
            )}

            <div className="flex-1">
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
                    if (editingMessageId) {
                      handleEdit();
                    } else {
                      handleSend();
                    }
                  }
                  if (e.key === "Escape") {
                    resetInput();
                    setShowEmoji(false);
                  }
                }}
                placeholder={
                  editingMessageId
                    ? "Edit message..."
                    : replyingTo
                    ? "Reply..."
                    : "Type a message..."
                }
                className="w-full bg-white/10 rounded-full py-3.5 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/70 transition-all text-base"
              />
            </div>

            <button
              onClick={editingMessageId ? handleEdit : handleSend}
              disabled={
                sendMessageMutation.isPending ||
                (!text.trim() &&
                  selectedFiles.length === 0 &&
                  !editingMessageId &&
                  !recordedBlob)
              }
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-full p-3.5 shadow-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            >
              {editingMessageId ? (
                <Edit2 size={22} className="text-white" />
              ) : (
                <Send size={22} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
