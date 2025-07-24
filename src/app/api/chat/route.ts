import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest } from "next/server";
import { Message } from "@/lib/types";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a helpful AI assistant.",
});

const generationConfig = {
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: history.map((msg: Message) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    // Get the last user message from history
    const lastUserMessage = history[history.length - 1]?.content;
    if (!lastUserMessage) {
      return new Response("No user message found in history", { status: 400 });
    }

    const result = await chat.sendMessageStream(lastUserMessage);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
