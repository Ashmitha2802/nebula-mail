export async function POST(request: Request) {
  try {
    const { subject, from, body } = await request.json();

    if (!body) {
      return Response.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an email assistant.

Summarize the following email clearly and concisely.
Mention the main purpose, important details, and any requested action.
Do not invent information.

Email From: ${from || "Unknown"}
Subject: ${subject || "No subject"}

Email Body:
${body}

Give the summary in 3-5 bullet points.
`;

    const response = await fetch(
      "http://localhost:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen2.5:3b",
          prompt,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    return Response.json({
      summary: data.response,
    });
  } catch (error) {
    console.error("AI summary error:", error);

    return Response.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}