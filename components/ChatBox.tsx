"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "mistral-memory-chat:last-messages";
const MAX_MESSAGES = 6; // 3 message pairs

function trimMessages(messages: ChatMessage[]) {
  return messages.length > MAX_MESSAGES
    ? messages.slice(messages.length - MAX_MESSAGES)
    : messages;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hasHydrated = useRef(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ChatMessage[];
        setMessages(Array.isArray(parsed) ? trimMessages(parsed) : []);
      }
    } catch (err) {
      console.error("Failed to load cached chat", err);
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    if (messages.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = input.trim();
    if (!raw || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: raw };
    const historyPayload = trimMessages(messages).map((message) => ({
      role: message.role,
      content: message.content
    }));

    setMessages((prev) => trimMessages([...prev, userMessage]));
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: raw, history: historyPayload })
      });

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }

      const data = (await response.json()) as { reply: string };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply ?? "No response"
      };

      setMessages((prev) => trimMessages([...prev, assistantMessage]));
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[28rem] flex-col">
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-neutral-50 px-4 py-4"
      >
        {messages.length === 0 && !isLoading ? (
          <p className="text-center text-sm text-neutral-500">
            Say hello and watch the last three exchanges stay around.
          </p>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} {...message} />
        ))}

        {isLoading ? (
          <div className="mr-auto flex items-center gap-2 rounded-2xl bg-neutral-200 px-4 py-3 text-sm text-neutral-700 shadow-sm ring-1 ring-black/5">
            <span className="h-2 w-2 animate-ping rounded-full bg-neutral-500" />
            Thinking…
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-inner ring-1 ring-neutral-200"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          name="message"
          autoComplete="off"
          placeholder="Ask Mistral anything…"
          className="flex-1 rounded-xl border border-transparent bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
          disabled={isLoading || input.trim().length === 0}
        >
          Send
        </button>
      </form>

      {error ? (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
