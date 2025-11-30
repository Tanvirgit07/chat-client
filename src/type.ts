// types/chat.ts   ← এই ফাইলটা বানাও (src/types/chat.ts)

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  avatar?: string;
  status?: "Online" | "Offline";
}

export interface ChatMessage {
  _id?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string | null;
  voice?: string | null;
  voiceDuration?: number;
  messageType?: "text" | "image" | "voice";
  createdAt: string;
  updatedAt?: string;
  seen?: boolean;
  edited?: boolean;
  deletedBy?: string[];

  // Reply fields
  replyTo?: string | null;
  replyToText?: string;
  replyToImage?: string | null;
  replyToVoice?: string | null;
  replyToSenderName?: string;
}