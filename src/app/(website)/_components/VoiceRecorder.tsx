"use client";

import React, { useState, useRef } from "react";
import { Mic, Send, X } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
}

export default function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      setIsRecording(true);
      setRecordedBlob(null);
      chunksRef.current = [];
    } catch (err) {
        console.error("ভয়েস রেকর্ডিং শুরু করতে ব্যর্থ:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setRecordedBlob(blob);
      setIsRecording(false);
      setDuration(0);
    };
  };

  const sendVoice = () => {
    if (recordedBlob) {
      onSend(recordedBlob, duration || 1);
      setRecordedBlob(null);
    }
  };

  const cancel = () => {
    setRecordedBlob(null);
    chunksRef.current = [];
  };

  if (recordedBlob) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/90 rounded-full px-5 py-3">
        <button onClick={cancel} className="text-red-400">
          <X size={24} />
        </button>
        <span className="text-white text-sm">ভয়েস রেকর্ড হয়েছে</span>
        <button onClick={sendVoice} className="text-green-400">
          <Send size={24} />
        </button>
      </div>
    );
  }

  return (
    <>
      {isRecording && (
        <div className="flex items-center gap-3 bg-red-600/30 rounded-full px-4 py-3 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="text-red-400 font-medium">
            {String(Math.floor(duration / 60)).padStart(2, '0')}:
            {String(duration % 60).padStart(2, '0')}
          </span>
          <span className="text-gray-300 text-xs">← বামে সোয়াইপ করে ক্যানসেল</span>
        </div>
      )}

      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`${
          isRecording 
            ? "bg-red-600" 
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        } rounded-full p-3.5 shadow-xl transition-all hover:scale-110 active:scale-95 flex-shrink-0`}
      >
        <Mic size={24} className="text-white" />
      </button>
    </>
  );
}