export async function POST(request: Request) {
  try {
    const { question, subject, from, body } =
      await request.json();

    if (!question) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!body) {
      return Response.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI email assistant.

Answer the user's question based ONLY on the email provided.
Do not invent information.
If the answer cannot be determined from the email, clearly say so.

Email From: ${from || "Unknown"}
Subject: ${subject || "No subject"}

Email Body:
${body}

User Question:
${question}

Give a clear and concise answer.
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
      answer: data.response,
    });
  } catch (error) {
    console.error("AI ask error:", error);

    return Response.json(
      { error: "Failed to answer question" },
      { status: 500 }
    );
  }
}