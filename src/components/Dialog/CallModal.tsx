// components/Dialog/CallModal.tsx
"use client";

import {
  LiveKitRoom,
  VideoConference,
  AudioConference,
  RoomAudioRenderer,
  useLocalParticipant,
} from "@livekit/components-react";
import { AudioPresets } from "livekit-client";
import "@livekit/components-styles";
import { X } from "lucide-react";

// প্রপসে callData যোগ করেছো কিন্তু ডিস্ট্রাকচার করোনি → এটাই এররের কারণ
interface CallModalProps {
  roomName: string;
  token: string;
  isVideo: boolean;
  onClose: () => void;
  callData?: {           // optional করো (যদি কেউ না পাঠায় তাহলেও চলবে)
    roomName: string;
    token: string;
    isVideo: boolean;
    audio?: boolean;
  };
}

// এখানে callData প্রপস রিসিভ করো
export default function CallModal({ 
  token, 
  isVideo, 
  onClose, 
  callData 
}: CallModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition-all"
      >
        <X size={36} />
      </button>

      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        token={token}
        connect={true}
        // এখানে callData থাকলে তার audio নাও, না থাকলে true (সবচেয়ে সেফ)
        audio={callData?.audio ?? true}
        video={isVideo}
        options={{
          publishDefaults: {
            audioPreset: AudioPresets.music,
            simulcast: isVideo,
            videoSimulcastLayers: isVideo ? undefined : [],
          },
          adaptiveStream: true,
          dynacast: true,
        }}
        onConnected={() => console.log("LiveKit Connected - Mic চালু!")}
        onDisconnected={onClose}
      >
        <RoomAudioRenderer />
        {isVideo ? <VideoConference /> : <AudioConference />}
        <MicIndicator />
      </LiveKitRoom>
    </div>
  );
}

function MicIndicator() {
  const { localParticipant } = useLocalParticipant();
  const micEnabled = localParticipant?.isMicrophoneEnabled;

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-green-500/50">
      <div className={`w-3 h-3 rounded-full ${micEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className={`font-medium ${micEnabled ? 'text-green-400' : 'text-red-400'}`}>
        {micEnabled ? 'Mic ON - কথা বলো' : 'Mic OFF'}
      </span>
    </div>
  );
}