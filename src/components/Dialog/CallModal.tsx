/* eslint-disable react-hooks/exhaustive-deps */
// frontend/components/Dialog/CallModal.tsx

"use client";

import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { X } from "lucide-react";
import { Room, RoomConnectOptions, RoomOptions } from "livekit-client";  // এই import গুলো add করো (npm i livekit-client)
import { useEffect, useMemo } from "react";

interface CallModalProps {
  roomName: string;
  token: string;
  isVideo: boolean;
  onClose: () => void;
}

export default function CallModal({
  roomName,
  token,
  isVideo,
  onClose,
}: CallModalProps) {
  // Room instance তৈরি + connect (এখানে roomName token এ include থাকবে backend থেকে)
  const room = useMemo(() => {
    const roomOptions: RoomOptions = {
      adaptiveStream: true,  // optional: ভালো performance
      dynacast: true,
    };

    const connectOptions: RoomConnectOptions = {
      autoSubscribe: true,   // সব ট্র্যাক অটো subscribe
    };

    const newRoom = new Room(roomOptions);
    newRoom
      .connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token, connectOptions)
      .then(() => console.log(`Connected to room: ${roomName}`))
      .catch((err) => {
        console.error("Connect failed:", err);
        onClose();  // error এ modal close করো
      });

    return newRoom;
  }, [token, roomName]);

  // Cleanup: disconnect on unmount
  useEffect(() => {
    return () => {
      room?.disconnect();
    };
  }, [room]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-colors"
        aria-label="Close call"
      >
        <X size={32} />
      </button>

      <LiveKitRoom
        room={room} // Room instance (string না!)
        video={isVideo}
        audio={true}
        className="w-full h-full" serverUrl={undefined} token={undefined}      >
        {isVideo ? <VideoConference /> : <AudioConference />}
      </LiveKitRoom>
    </div>
  );
}