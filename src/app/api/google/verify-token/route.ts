import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const oauth2Client = new google.auth.OAuth2();
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return NextResponse.json(
      {
        verified: true,
        email: payload?.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json(
      {
        verified: false,
        error: "Token verification failed",
      },
      { status: 401 }
    );
  }
}