export async function POST(request: Request) {
  try {
    const { query, emails } = await request.json();

    if (!query) {
      return Response.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (!emails || !Array.isArray(emails)) {
      return Response.json(
        { error: "Emails are required" },
        { status: 400 }
      );
    }

    const emailData = emails.map((email: any) => ({
      id: email.id,
      from: email.from,
      subject: email.subject,
      body: email.body,
    }));

    const prompt = `
You are an AI email search assistant.

The user wants to find emails using this natural-language query:

"${query}"

Here are the available emails:

${JSON.stringify(emailData, null, 2)}

Find the emails that best match the user's request.

Return ONLY valid JSON in exactly this format:

{
  "matchingIds": [
    "email-id-1",
    "email-id-2"
  ]
}

Rules:
- Return only IDs from the provided emails.
- If no emails match, return an empty array.
- Match based on sender, subject, and email content.
- Understand natural language.
- "interview emails" can match emails about interviews.
- "job emails" can match recruitment, interview, placement, internship, or job-related emails.
- "urgent emails" can match deadlines, immediate action, important requests, or urgent messages.
- "work emails" can match workplace, project, meeting, office, or professional emails.
- "finance emails" can match payments, transactions, bills, banking, money, invoices, etc.
- Do not invent email IDs.
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

    const result = JSON.parse(data.response);

    const validIds = result.matchingIds?.filter(
      (id: string) =>
        emailData.some(
          (email: any) => email.id === id
        )
    ) || [];

    return Response.json({
      matchingIds: validIds,
    });
  } catch (error) {
    console.error(
      "AI search error:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to perform AI search",
      },
      { status: 500 }
    );
  }
}