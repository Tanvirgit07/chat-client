// components/Dialog/IncomingCallModal.tsx
"use client";

import { Phone, Video, X, PhoneIncoming } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface Props {
  callerName: string;
  callerImage?: string;
  isVideo: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  callerName,
  callerImage,
  isVideo,
  onAccept,
  onReject,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/images/rington.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.8;
    audioRef.current.play().catch(() => {});

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center gap-8 px-6">
      {/* Animated Waves */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/40 w-64 h-64" />
        <div className="absolute inset-0 animate-ping delay-700 rounded-full bg-pink-500/40 w-64 h-64" />

        {/* Caller Photo */}
        <div className="relative z-10 w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl border-4 border-white/20">
          {callerImage ? (
            <Image
              src={callerImage}
              alt={callerName}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
              {callerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Caller Info */}
      <div className="text-center">
        <h2 className="text-white text-4xl font-bold">{callerName}</h2>
        <p className="text-white/80 text-xl mt-3 flex items-center justify-center gap-3">
          {isVideo ? <Video size={32} /> : <PhoneIncoming size={32} />}
          {isVideo ? "Incoming Video Call" : "Incoming Audio Call"}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-20">
        <button
          onClick={onReject}
          className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full transition-all shadow-2xl hover:scale-110 active:scale-95"
        >
          <X size={44} />
        </button>

        <button
          onClick={onAccept}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-full transition-all shadow-2xl hover:scale-110 active:scale-95"
        >
          <Phone size={44} />
        </button>
      </div>
    </div>
  );
}