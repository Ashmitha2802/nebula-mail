import { generateWithOllama } from "@/lib/ollama";

export async function POST(request: Request) {
  try {
    const { command, emails, currentEmail } =
      await request.json();

    if (!command) {
      return Response.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const text = command.trim();

    // --------------------------------------------------
    // 1. SEND EMAIL - handle directly
    // --------------------------------------------------
    const sendMatch = text.match(
      /send\s+(?:an\s+)?email\s+to\s+([^\s]+@[^\s]+)(?:\s+(.+))?/i
    );

    if (sendMatch) {
      const recipient = sendMatch[1];
      const remainingText = sendMatch[2] || "";

      let subject = "";
      let body = remainingText;

      // Prefer a quoted subject
      const quotedSubjectMatch = remainingText.match(
        /subject\s*[:\-]?\s*["']([^"']+)["']/i
      );

      if (quotedSubjectMatch) {
        subject = quotedSubjectMatch[1].trim();
        body = remainingText
          .replace(quotedSubjectMatch[0], "")
          .trim();
      } else {
        // Unquoted subject
        const subjectMatch = remainingText.match(
          /subject\s*[:\-]?\s*(.+?)(?=\s+(?:saying|say)\b|$)/i
        );

        if (subjectMatch) {
          subject = subjectMatch[1].trim();
          body = remainingText
            .replace(subjectMatch[0], "")
            .trim();
        }
      }

      // Extract saying/say body
      const quotedSayingMatch = body.match(
        /(?:saying|say)\s+["']([^"']+)["']/i
      );

      if (quotedSayingMatch) {
        body = quotedSayingMatch[1].trim();
      } else {
        const sayingMatch = body.match(
          /(?:saying|say)\s+(.+)/i
        );

        if (sayingMatch) {
          body = sayingMatch[1].trim();
        }
      }

      return Response.json({
        action: "SEND_EMAIL",
        recipient,
        subject,
        body,
        filterType: "",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 2. OPEN COMPOSE
    // --------------------------------------------------
    if (
      /^(compose|write|new email|compose email|write an email)$/i.test(
        text
      )
    ) {
      return Response.json({
        action: "OPEN_COMPOSE",
        recipient: "",
        subject: "",
        body: "",
        filterType: "",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 3. REPLY TO CURRENT EMAIL
    // --------------------------------------------------
    if (/^reply\b/i.test(text)) {
      let replyBody = text;

      replyBody = replyBody
        .replace(
          /^reply\s+to\s+(?:this\s+email|this)\s*/i,
          ""
        )
        .replace(/^reply\s*/i, "")
        .trim();

      replyBody = replyBody
        .replace(/^(saying|with)\s+/i, "")
        .trim();

      return Response.json({
        action: "REPLY_EMAIL",
        recipient: "",
        subject: "",
        body: replyBody,
        filterType: "",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 3.5. FORWARD CURRENT EMAIL
    // --------------------------------------------------
    if (/^forward\b/i.test(text)) {
      let forwardBody = text
        .replace(
          /^forward\s+(this\s+email|this)?\s*/i,
          ""
        )
        .trim();

      forwardBody = forwardBody
        .replace(/^(saying|with)\s+/i, "")
        .trim();

      return Response.json({
        action: "FORWARD_EMAIL",
        recipient: "",
        subject: "",
        body: forwardBody,
        filterType: "",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 4. UNREAD EMAILS
    // --------------------------------------------------
    if (
      /show\s+(me\s+)?unread\s+emails/i.test(text) ||
      /unread\s+emails/i.test(text)
    ) {
      return Response.json({
        action: "FILTER_EMAILS",
        recipient: "",
        subject: "",
        body: "",
        filterType: "unread",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 5. STARRED EMAILS
    // --------------------------------------------------
    if (
      /show\s+(me\s+)?starred\s+emails/i.test(text) ||
      /starred\s+emails/i.test(text)
    ) {
      return Response.json({
        action: "FILTER_EMAILS",
        recipient: "",
        subject: "",
        body: "",
        filterType: "starred",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 6. RECENT EMAILS
    // --------------------------------------------------
    const recentMatch = text.match(
      /(?:show\s+(?:me\s+)?)?(?:emails\s+)?from\s+(?:the\s+)?last\s+(\d+)\s+days?/i
    );

    if (recentMatch) {
      return Response.json({
        action: "FILTER_EMAILS",
        recipient: "",
        subject: "",
        body: "",
        filterType: "recent",
        filterValue: recentMatch[1],
      });
    }

    // --------------------------------------------------
    // 7. SUMMARIZE CURRENT EMAIL
    // --------------------------------------------------
    if (
      /summari[sz]e\s+(this|the)\s+email/i.test(text) ||
      /summari[sz]e\s+email/i.test(text)
    ) {
      return Response.json({
        action: "SUMMARIZE_EMAIL",
        recipient: "",
        subject: "",
        body: "",
        filterType: "",
        filterValue: "",
      });
    }

    // --------------------------------------------------
    // 7.5. SUBJECT / KEYWORD EMAIL SEARCH
    // --------------------------------------------------
    const hasSenderClue = /\bfrom\b/i.test(text);

    const relatedMatch = !hasSenderClue
      ? text.match(
          /(?:show|find|get)\s+(?:me\s+)?(.+?)\s+(?:related\s+)?(?:emails?|mails?|messages?)\s*$/i
        )
      : null;

    if (relatedMatch) {
      const keyword = relatedMatch[1]
        .replace(/^(the|a|an)\s+/i, "")
        .trim();

      const ignoredWords = [
        "unread",
        "starred",
        "recent",
        "last",
        "all",
        "",
      ];

      const isIgnored = ignoredWords.some(
        (word) => keyword.toLowerCase() === word
      );

      if (keyword && !isIgnored) {
        return Response.json({
          action: "FILTER_EMAILS",
          recipient: "",
          subject: "",
          body: "",
          filterType: "subject",
          filterValue: keyword,
        });
      }
    }

    // --------------------------------------------------
    // 8. ASK AI ABOUT CURRENT EMAIL
    // --------------------------------------------------
    if (
      /what\s+(does|is|are|was|were)/i.test(text) ||
      /tell\s+me\s+about\s+this\s+email/i.test(text) ||
      /explain\s+this\s+email/i.test(text)
    ) {
      return Response.json({
        action: "ASK_ABOUT_EMAIL",
        recipient: "",
        subject: "",
        body: "",
        filterType: "",
        filterValue: "",
        question: text,
      });
    }

    // --------------------------------------------------
    // 9. FALLBACK TO OLLAMA
    // --------------------------------------------------
    const prompt = `
You are the central AI assistant for an email application.

Understand the user's command and decide what application action should happen.

User command:

"${text}"

Current email:

${JSON.stringify(
  currentEmail || null,
  null,
  2
)}

Available emails:

${JSON.stringify(
  emails || [],
  null,
  2
)}

Allowed actions:

SEND_EMAIL
REPLY_EMAIL
FORWARD_EMAIL
FILTER_EMAILS
SUMMARIZE_EMAIL
ASK_ABOUT_EMAIL
OPEN_COMPOSE
NONE

For FILTER_EMAILS, allowed filterType values:

- unread
- starred
- sender
- subject
- recent
- all

Return ONLY valid JSON.

Format:

{
  "action": "NONE",
  "recipient": "",
  "subject": "",
  "body": "",
  "filterType": "",
  "filterValue": ""
}

Rules:

- Never invent an email address.
- Never invent email content.
- Use current email context only when needed.
`;

    const data = await generateWithOllama(
      "qwen2.5:3b",
      prompt,
      { format: "json" }
    );

    const result = JSON.parse(data.response);

    return Response.json(result);
  } catch (error) {
    console.error(
      "AI assistant error:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to process assistant command",
      },
      { status: 500 }
    );
  }
}