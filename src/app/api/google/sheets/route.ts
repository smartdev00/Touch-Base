import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { data, accessToken } = await req.json();
    console.log("Receive request: ", data, accessToken)

    const keysPath = path.join(process.cwd(), "./touch-base-voice-note-ea9ccce4244c.json");
    const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
    const client = new google.auth.JWT(keys.client_email, "", keys.private_key, [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ]);

    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: data.spreadSheetId,
      range: 'Voice Notes!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.timestamp,
          data.names,
          data.location,
          data.nature,
          data.followupDate,
        ]],
      },
    });

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error in Google Sheets API:', error);
    return NextResponse.json(
      { error: 'Failed to export to Google Sheets' },
      { status: 500 }
    );
  }
} 