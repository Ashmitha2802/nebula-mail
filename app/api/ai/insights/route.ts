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
You are an email analysis assistant.

Analyze the email below.

Email From: ${from || "Unknown"}
Subject: ${subject || "No subject"}

Email Body:
${body}

Return ONLY valid JSON in exactly this format:

{
  "keyPoints": [
    "important point 1",
    "important point 2",
    "important point 3"
  ],
  "actionItems": [
    "action item 1",
    "action item 2"
  ]
}

Rules:
- keyPoints should contain the most important information from the email.
- actionItems should contain things the recipient needs to do.
- If there are no action items, return an empty array.
- Do not invent information.
- Keep each point short and clear.
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
          format: "json",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    let result;

    try {
      result = JSON.parse(data.response);
    } catch {
      return Response.json({
        keyPoints: [data.response],
        actionItems: [],
      });
    }

    return Response.json({
      keyPoints: result.keyPoints || [],
      actionItems: result.actionItems || [],
    });
  } catch (error) {
    console.error("AI insights error:", error);

    return Response.json(
      { error: "Failed to analyze email" },
      { status: 500 }
    );
  }
}