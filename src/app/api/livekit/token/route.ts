/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/livekit/token/route.ts

import { NextRequest } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const dynamic = "force-dynamic";          // খুব জরুরি
export const revalidate = 0;                     // আরও নিশ্চিত করা

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room");
    const identity = searchParams.get("identity");

    // দুটোই মাস্ট, কোনো ডিফল্ট রাখব না
    if (!room || !identity) {
      return Response.json(
        { error: "room and identity are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    // কোনো ! দিব না
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("LiveKit credentials missing in .env.local");
      return Response.json({ error: "Server error" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      // name: identity, // অপশনাল
      ttl: "10m", // ১০ মিনিট যথেষ্ট
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const token = await at.toJwt();

    return Response.json({ token });
  } catch (err: any) {
    console.error("LiveKit token error:", err.message);
    return Response.json({ error: "Token generation failed" }, { status: 500 });
  }
}