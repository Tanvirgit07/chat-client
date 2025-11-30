// frontend/components/Dialog/CallModal.tsx

"use client";

import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { X } from "lucide-react";

interface CallModalProps {
  roomName: string;
  token: string;
  isVideo: boolean;
  onClose: () => void;
}

export default function CallModal({ roomName, token, isVideo, onClose }: CallModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition"
      >
        <X size={32} />
      </button>

      {/* LiveKit Room */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        video={isVideo}
        audio={true}
        // এখানে room প্রপস হিসেবে roomName পাস করো
        connectOptions={{
          autoSubscribe: true,
          room: roomName,   // এটাই সঠিক নাম!
        }}
        className="w-full h-full"
      >
        {isVideo ? <VideoConference /> : <AudioConference />}
      </LiveKitRoom>
    </div>
  );
}