import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Body: ", body);
  const email = body?.email;
  // const email = body.data
  // Load the service account key JSON file
  const keysPath = path.join(process.cwd(), "./touch-base-voice-note-ea9ccce4244c.json");
  const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
  console.log("Key: ", keys);

  const client = new google.auth.JWT(keys.client_email, "", keys.private_key, [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ]);

  const sheets = google.sheets({ version: "v4", auth: client });
  const drive = google.drive({ version: "v3", auth: client });

  try {
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: "TouchBase With Exports",
        },
        sheets: [
          {
            properties: {
              title: "Voice Notes",
              gridProperties: {
                columnCount: 5,
                rowCount: 1000,
                frozenRowCount: 1,
              },
            },
            data: [
              {
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "Date + Time of Voicenote" } },
                      { userEnteredValue: { stringValue: "Name" } },
                      { userEnteredValue: { stringValue: "Location of Convo" } },
                      { userEnteredValue: { stringValue: "Nature of Message" } },
                      { userEnteredValue: { stringValue: "Followup Date" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    console.log("Spreadsheet created:", response.data);

    if (!response.data.spreadsheetId) {
      throw new Error("Failed to create spreadsheet");
    }
    const spreadSheetId = response.data.spreadsheetId;

    const { data } = await sheets.spreadsheets.get({
      spreadsheetId: spreadSheetId,
      includeGridData: false,
    });
    const sheetId = data.sheets?.find((she) => she.properties?.title === "Voice Notes")?.properties?.sheetId;
    console.log("sheetId: ", sheetId);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadSheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 11,
                  },
                  horizontalAlignment: "CENTER",
                  verticalAlignment: "MIDDLE",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
            },
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });
    console.log("First Batch Update");

    // Auto-resize columns to fit content
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadSheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 5,
              },
            },
          },
        ],
      },
    });
    console.log("Second Batch Update");

    await drive.permissions.create({
      requestBody: {
        role: "writer",
        type: "user",
        emailAddress: email,
      },
      fileId: spreadSheetId || "",
    });
    console.log("Permission is created.");

    return NextResponse.json({
      success: true,
      spreadsheetId: spreadSheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadSheetId}`,
    });
  } catch (error) {
    console.error("Error creating Google Sheet:", error);
    throw error;
  }
}
