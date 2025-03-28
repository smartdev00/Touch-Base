// import { NextResponse } from "next/server";
// import fs from "fs";
// import OpenAI from "openai";
// import { Readable } from "stream";
// import { Uploadable } from "openai/uploads.mjs";

// const openai = new OpenAI();

// export async function POST(req: Request) {
//   const body = await req.json();

//   const base64Audio = body.audio;

//   // Convert the base64 audio data to a Buffer
//   const audioBuffer = Buffer.from(base64Audio, "base64");

//   // Define the file path for storing the temporary WAV file
//   const filePath = "tmp/input.wav";

//   try {
//     // Create a readable stream from the audio buffer
//     const readStream = new Readable();
//     readStream.push(audioBuffer);
//     readStream.push(null); // Signal the end of the stream

//     // Write the audio data to a temporary WAV file synchronously
//     // fs.writeFileSync(filePath, audio);

//     // Create a readable stream from the temporary WAV file
//     // const readStream = fs.createReadStream(filePath);

//     const data = await openai.audio.transcriptions.create({
//       file: readStream,
//       model: "whisper-1",
//     });

//     // Remove the temporary file after successful processing
//     fs.unlinkSync(filePath);

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Error processing audio:", error);
//     return NextResponse.error();
//   }
// }

import { NextResponse } from "next/server";
import fs from "fs";
import OpenAI from "openai";
import path from "path";

const openai = new OpenAI({apiKey: 'My API key'});

export async function POST(req: Request) {
  const body = await req.json();

  const base64Audio = body.audio;

  // Convert the base64 audio data to a Buffer
  const audio = Buffer.from(base64Audio, "base64");

  // Define the file path for storing the temporary WAV file
  const filePath = path.join(process.cwd(), "tmp", "input.wav");

  try {
    // Ensure the tmp directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Write the audio data to a temporary WAV file synchronously
    fs.writeFileSync(filePath, audio);

    // Create a readable stream from the temporary WAV file
    const readStream = fs.createReadStream(filePath);

    // Call OpenAI Whisper API for transcription
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    // Remove the temporary file after successful processing
    fs.unlinkSync(filePath);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    
    // Optionally, you can return a more descriptive error response
    return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
  }
}
