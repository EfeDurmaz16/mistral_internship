const API_URL = "https://api.mistral.ai/v1/chat/completions";
const MODEL = "mistral-tiny";

type MistralMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type MistralResponse = {
  choices: Array<{
    message: {
      role: "assistant";
      content: string;
    };
  }>;
};

export async function createChatCompletion(message: string, history: MistralMessage[] = []) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("Missing MISTRAL_API_KEY environment variable.");
  }

  const payload = {
    model: MODEL,
    messages: [...history, { role: "user", content: message }]
  } satisfies { model: string; messages: MistralMessage[] };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as MistralResponse;
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Mistral API returned an empty response.");
  }

  return reply;
}
