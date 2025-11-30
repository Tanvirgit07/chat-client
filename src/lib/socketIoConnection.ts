/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// lib/socketIoConnection.ts
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/type";

type MessageEditedHandler = (message: ChatMessage) => void;
type MessageDeletedHandler = (data: { messageId: string; deletedFor?: string[]; deletedForEveryone?: boolean }) => void;
type IncomingCallHandler = (data: { callerId: string; roomName: string; isVideo: boolean }) => void; // নতুন

let globalSocket: Socket | null = null;

export default function useSocket(
  onNewMessage?: (message: ChatMessage) => void,
  onOnlineUsers?: (users: string[]) => void,
  onMessageEdited?: MessageEditedHandler,
  onMessageDeleted?: MessageDeletedHandler,
  onIncomingCall?: IncomingCallHandler // ৫ম কলব্যাক যোগ হলো
) {
  const { data: session, status } = useSession();
  const callbacks = useRef({
    onNewMessage,
    onOnlineUsers,
    onMessageEdited,
    onMessageDeleted,
    onIncomingCall, // নতুন
  }).current;

  // কলব্যাক আপডেট
  useEffect(() => {
    callbacks.onNewMessage = onNewMessage;
    callbacks.onOnlineUsers = onOnlineUsers;
    callbacks.onMessageEdited = onMessageEdited;
    callbacks.onMessageDeleted = onMessageDeleted;
    callbacks.onIncomingCall = onIncomingCall; // নতুন
  }, [onNewMessage, onOnlineUsers, onMessageEdited, onMessageDeleted, onIncomingCall]);

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

    if (globalSocket?.connected && (globalSocket.io.opts.query as any)?.userId === userId) {
      return;
    }

    if (globalSocket) {
      globalSocket.off();
      globalSocket.disconnect();
    }

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

    // সব লিসেনার এখানে
    globalSocket.on("getOnlineUsers", (users: string[]) => callbacks.onOnlineUsers?.(users));
    globalSocket.on("newMessage", (msg: ChatMessage) => callbacks.onNewMessage?.(msg));
    globalSocket.on("messageEdited", (msg: ChatMessage) => callbacks.onMessageEdited?.(msg));
    globalSocket.on("messageDeleted", (data: any) => callbacks.onMessageDeleted?.(data));
    
    // এইটা নতুন — ব্যাকেন্ড থেকে "call-request" আসলে চলবে
    globalSocket.on("call-request", (data: any) => callbacks.onIncomingCall?.(data));

  }, [status, session]);

  return globalSocket;
}