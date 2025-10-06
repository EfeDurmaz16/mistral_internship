import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/mistralClient";

type RequestBody = {
  message?: string;
  history?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const reply = await createChatCompletion(message, body.history ?? []);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
