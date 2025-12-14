# 💬 Real-Time Chat Application

A modern, real-time chat application built with a focus on performance, scalability, and user experience.  
This project supports instant messaging, emojis, file sharing, and is designed to scale with advanced features like audio & video calling.

---

## 🚀 Features

- 🔐 Secure user authentication
- 💬 Real-time one-to-one messaging
- 😊 Emoji support
- 📎 File & media sharing
- 🟢 Online / offline user status
- ✏️ Edit & delete messages
- 🔄 Real-time updates using WebSockets
- 📱 Fully responsive (Mobile, Tablet, Desktop)

### 🔜 Upcoming Features
- 🎙️ Voice messages
- 📞 Audio calling
- 🎥 Video calling
- 🔔 Push notifications
- 👥 Group chat support

---

## 🛠️ Tech Stack

### Frontend
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **shadcn/ui**

### Backend
- **Node.js**
- **Express.js**
- **Socket.IO**

### Database
- **MongoDB**

### Real-Time & Media (Planned)
- **WebSocket (Socket.IO)**
- **WebRTC (for audio/video calls)**

---

## 📂 Project Structure

```bash
chat-app/
├── client/              # Frontend (Next.js)
│   ├── components/
│   ├── app/
│   ├── lib/
│   └── types/
├── server/              # Backend (Node + Express)
│   ├── controllers/
│   ├── routes/
│   ├── socket/
│   └── models/
├── README.md
└── package.json
