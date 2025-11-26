/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { ChatMessage } from "@/type";

export default function useSocket(
  onNewMessage?: (message: ChatMessage) => void,
  onOnlineUsers?: (users: string[]) => void
) {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;
    const user = session?.user as any;
    const userId = user?._id || user?.id;
    if (!userId) return;

    const socket = io(SOCKET_URL, { query: { userId } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("getOnlineUsers", (onlineUsers: string[]) => onOnlineUsers?.(onlineUsers));
    socket.on("newMessage", (message: ChatMessage) => onNewMessage?.(message));

    return () => { socket.disconnect(); };
  }, [status, session]);

  return socketRef;
}