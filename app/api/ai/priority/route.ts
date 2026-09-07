export async function POST(request: Request) {
  try {
    const { subject, from, body } =
      await request.json();

    if (!body) {
      return Response.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an email classification assistant.

Analyze this email and return ONLY valid JSON.

Email From:
${from || "Unknown"}

Subject:
${subject || "No subject"}

Email Body:
${body}

Classify the email using:

Priority:
- High
- Medium
- Low

Category:
- Work
- Internship
- Education
- Finance
- Shopping
- Promotion
- Personal
- Other

Rules:
- High = urgent, deadline, important action, interview, job-related action, payment issue, or requires immediate attention.
- Medium = useful or important but not urgent.
- Low = informational, promotional, casual, or no action required.
- Do not invent information.

Return exactly this JSON format:

{
  "priority": "High",
  "category": "Work",
  "reason": "Short reason"
}
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
      throw new Error(
        "Ollama request failed"
      );
    }

    const data = await response.json();

    const result = JSON.parse(
      data.response
    );

    return Response.json({
      priority: result.priority,
      category: result.category,
      reason: result.reason,
    });
  } catch (error) {
    console.error(
      "AI priority error:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to classify email",
      },
      { status: 500 }
    );
  }
}