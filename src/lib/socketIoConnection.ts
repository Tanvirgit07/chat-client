/* eslint-disable react-hooks/exhaustive-deps */
// lib/socketIoConnection.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/type";

type MessageEditedHandler = (message: ChatMessage) => void;
type MessageDeletedHandler = (data: { messageId: string; deletedFor?: string[]; deletedForEveryone?: boolean }) => void;

// গ্লোবাল সকেট — একবারই তৈরি হবে
let globalSocket: Socket | null = null;

export default function useSocket(
  onNewMessage?: (message: ChatMessage) => void,
  onOnlineUsers?: (users: string[]) => void,
  onMessageEdited?: MessageEditedHandler,
  onMessageDeleted?: MessageDeletedHandler
) {
  const { data: session, status } = useSession();
  const callbacks = useRef({
    onNewMessage,
    onOnlineUsers,
    onMessageEdited,
    onMessageDeleted,
  }).current;

  // কলব্যাক আপডেট করো
  useEffect(() => {
    callbacks.onNewMessage = onNewMessage;
    callbacks.onOnlineUsers = onOnlineUsers;
    callbacks.onMessageEdited = onMessageEdited;
    callbacks.onMessageDeleted = onMessageDeleted;
  }, [onNewMessage, onOnlineUsers, onMessageEdited, onMessageDeleted]);

  useEffect(() => {
    if (status !== "authenticated" || !session) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      return;
    }

    const user = session.user as any;
    const userId = user?._id || user?.id;
    if (!userId) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;

    // যদি আগে থেকে সকেট থাকে এবং সেইম ইউজার, তাহলে রি-ইউজ করো
    if (globalSocket?.connected && (globalSocket.io.opts.query as any)?.userId === userId) {
      return;
    }

    // পুরানো সকেট থাকলে ক্লিন করো
    if (globalSocket) {
      globalSocket.off();
      globalSocket.disconnect();
    }

    // নতুন সকেট তৈরি
    globalSocket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    globalSocket.on("connect", () => {
      console.log("Socket Connected:", globalSocket!.id);
    });

    globalSocket.on("disconnect", (reason) => {
      console.log("Socket Disconnected:", reason);
    });

    globalSocket.on("getOnlineUsers", (users: string[]) => callbacks.onOnlineUsers?.(users));
    globalSocket.on("newMessage", (msg: ChatMessage) => callbacks.onNewMessage?.(msg));
    globalSocket.on("messageEdited", (msg: ChatMessage) => callbacks.onMessageEdited?.(msg));
    globalSocket.on("messageDeleted", (data: any) => callbacks.onMessageDeleted?.(data));

  }, [status, session]);

  return globalSocket;
}