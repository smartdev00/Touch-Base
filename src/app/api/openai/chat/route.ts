import { createOpenAI } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  
  try {
    const { messages, openaiKey } = await req.json();
    const openai = createOpenAI({
      apiKey: openaiKey,
      baseURL: "https://api.openai.com/v1",
    });
    const result = await streamText({
      model: openai("gpt-4o"),
      system: "You are a helpful AI assistant",
      messages: convertToCoreMessages(messages),
    });
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error while handling openai", error)
    if((error as any)?.responseBody) {
      const responseBody = JSON.parse((error as any)?.responseBody);
      console.log("responseBody", responseBody?.error?.code)
      if(responseBody?.error?.code == "unsupported_country_region_territory")
        return NextResponse.json({ error: "Your openai API key is invalid." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
