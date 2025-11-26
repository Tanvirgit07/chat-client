export interface User {
  _id: string;
  fullName: string;
  email?: string;
  profileImage?: string;
}

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  text?: string; // optional to match socket
  image?: string;
  createdAt: string;
  _id?: string;
  updatedAt?: string;
}
