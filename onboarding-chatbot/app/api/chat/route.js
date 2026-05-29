// MOCK MODE — replace this with the real Anthropic implementation once you have an API key.
// To switch to live: uncomment the Anthropic block below and remove the mock return.

import systemPrompt from "@/lib/systemPrompt";

export async function POST(request) {
  try {
    const { messages } = await request.json();
    const lastMessage = messages[messages.length - 1]?.content ?? "";

    // Mock reply — echoes the system prompt role and last user message so you can
    // verify the prompt is loading correctly before wiring up a real API key.
    const reply =
      `[MOCK MODE — no API key set]\n\n` +
      `I received your message: "${lastMessage}"\n\n` +
      `The system prompt is loaded and is ${systemPrompt.length.toLocaleString()} characters long. ` +
      `Once you add your ANTHROPIC_API_KEY to .env.local and restore the Anthropic client in route.js, ` +
      `the real onboarding assistant will respond here.`;

    return Response.json({ reply });
  } catch (err) {
    console.error("API route error:", err);
    return Response.json(
      { reply: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/*
  REAL IMPLEMENTATION — uncomment when you have an API key:

  import Anthropic from "@anthropic-ai/sdk";
  import systemPrompt from "@/lib/systemPrompt";

  const client = new Anthropic();

  export async function POST(request) {
    try {
      const { messages } = await request.json();
      const response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      });
      const reply = response.content[0]?.text ?? "";
      return Response.json({ reply });
    } catch (err) {
      console.error("API route error:", err);
      return Response.json(
        { reply: "Sorry, something went wrong. Please try again." },
        { status: 500 }
      );
    }
  }
*/
