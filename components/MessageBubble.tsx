export type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
};

const bubbleStyles: Record<MessageBubbleProps["role"], string> = {
  user: "ml-auto bg-neutral-900 text-white",
  assistant: "mr-auto bg-neutral-200 text-neutral-900"
};

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div
      className={`flex w-fit max-w-full rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ring-black/5 ${bubbleStyles[role]}`}
    >
      <p className="whitespace-pre-wrap break-words">{content}</p>
    </div>
  );
}
