// components/Dialog/CallModal.tsx
"use client";

import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CallModalProps {
  roomName: string;
  token: string;
  isVideo: boolean;
  onClose: () => void;
}

export default function CallModal({ token, isVideo, onClose }: CallModalProps) {
  const triggered = useRef(false);

  // এই useEffect টা ১০০% মাইক পারমিশন ট্রিগার করবে — রিসিভারেরও!
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const forceMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: isVideo 
        });
        // stream টা আমরা ব্যবহার করবো না, শুধু পারমিশন নেওয়ার জন্য
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.log("Mic permission requested (user may deny)", err);
      }
    };

    // ৫০০ms পর ট্রিগার করি যাতে মডাল পুরোপুরি ওপেন হয়
    const timer = setTimeout(forceMic, 500);
    return () => clearTimeout(timer);
  }, [isVideo]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl"
      >
        <X size={36} />
      </button>

      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
        audio={true}
        video={isVideo}
        connectOptions={{ autoSubscribe: true }}
      >
        <RoomAudioRenderer />
        {isVideo ? <VideoConference /> : <AudioConference />}
      </LiveKitRoom>
    </div>
  );
}