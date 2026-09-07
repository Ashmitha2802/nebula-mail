const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

export async function generateWithOllama(
  model: string,
  prompt: string,
  options: Record<string, unknown> = {}
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      ...(
        options.format === "json"
          ? {
              response_format: {
                type: "json_object",
              },
            }
          : {}
      ),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq request failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  return {
    response:
      data.choices?.[0]?.message?.content || "",
  };
}