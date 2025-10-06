import ChatBox from "@/components/ChatBox";

export default function Page() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-neutral-200">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Mistral Memory Chat</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Converse with Mistral AI and keep your last three exchanges.
          </p>
        </header>
        <ChatBox />
      </div>
    </main>
  );
}
