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

  // রিংটোন প্লে করা
  useEffect(() => {
    audioRef.current = new Audio("/images/rington.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.8;
    audioRef.current
      .play()
      .catch((err) => console.log("Ringtone autoplay blocked:", err));

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // মোবাইল + ডেস্কটপ দুটোতেই ইনস্ট্যান্ট কাজ করার জন্য
  const handleAccept = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onAccept();
  };

  const handleReject = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onReject();
  };

  return (
    <div
      className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center gap-8 px-6 select-none"
      // পুরো স্ক্রিনে টাচ করলেও কিছু না হয়
      onClick={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {/* Animated Pulse Rings */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/40 w-64 h-64" />
        <div className="absolute inset-0 animate-ping animation-delay-700 rounded-full bg-pink-500/40 w-64 h-64" />

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

      {/* Accept & Reject Buttons – মোবাইলে ১০০% প্রথম টাচেই কাজ করবে */}
      <div className="flex gap-20 select-none">
        {/* Reject Button */}
        <button
          onMouseDown={handleReject}
          onTouchEnd={handleReject}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white p-6 rounded-full transition-all shadow-2xl active:scale-95 touch-manipulation select-none focus:outline-none"
          aria-label="Reject call"
        >
          <X size={44} />
        </button>

        {/* Accept Button */}
        <button
          onMouseDown={handleAccept}
          onTouchEnd={handleAccept}
          className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-6 rounded-full transition-all shadow-2xl active:scale-95 touch-manipulation select-none focus:outline-none"
          aria-label="Accept call"
        >
          <Phone size={44} />
        </button>
      </div>
    </div>
  );
}