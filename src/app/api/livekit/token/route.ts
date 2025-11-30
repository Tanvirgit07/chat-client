// frontend/app/api/livekit/token/route.ts   ← এই ফাইলটা নতুন বানাও

import { NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const identity = searchParams.get("identity") || `user_${Date.now()}`;

  if (!room) {
    return new Response(JSON.stringify({ error: "room is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  const token = await at.toJwt();

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}