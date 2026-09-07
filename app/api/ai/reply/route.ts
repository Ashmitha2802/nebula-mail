export async function POST(request: Request) {
  try {
    const {
      subject,
      from,
      body,
      instruction,
      tone,
    } = await request.json();

    if (!body) {
      return Response.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }

    let toneInstruction =
      "Use a professional, polite, and clear tone.";

    if (tone === "friendly") {
      toneInstruction =
        "Use a warm, friendly, natural, and conversational tone.";
    }

    if (tone === "short") {
      toneInstruction =
        "Keep the reply very short and concise, preferably 2-4 sentences.";
    }

    const prompt = `
You are an AI email assistant.

Write a natural reply to the email below.

Email From: ${from || "Unknown"}
Email Subject: ${subject || "No subject"}

Email Body:
${body}

Additional instruction:
${instruction || "Write a suitable reply to this email."}

Tone:
${toneInstruction}

Rules:
- Reply based ONLY on the information in the email.
- Do not invent facts, dates, promises, or commitments.
- Keep the reply natural and appropriate.
- DO NOT write a subject line.
- DO NOT write "Subject:" anywhere.
- DO NOT use placeholders such as [Your Name], [Name], [Company Name], etc.
- DO NOT invent a sender name or signature.
- If a signature is needed, end the reply without a name.
- Return ONLY the email reply body.
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

    let reply = data.response || "";

    // Remove accidental subject line
    reply = reply
      .replace(/^Subject\s*:\s*.*\n?/i, "")
      .trim();

    // Remove accidental placeholder signatures
    reply = reply
      .replace(/\[Your Name\]/gi, "")
      .replace(/\[Name\]/gi, "")
      .trim();

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error("AI reply error:", error);

    return Response.json(
      { error: "Failed to generate AI reply" },
      { status: 500 }
    );
  }
}