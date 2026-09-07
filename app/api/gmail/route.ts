import { google } from "googleapis";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "inbox";

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    let labelIds = ["INBOX"];

if (folder === "starred") {
  labelIds = ["STARRED"];
} else if (folder === "trash") {
  labelIds = ["TRASH"];
} else if (folder === "sent") {
  labelIds = ["SENT"];
}

    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds,
    });

    const messages = listResponse.data.messages ?? [];

    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        const response = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "full",
        });

        const headers = response.data.payload?.headers ?? [];

        const getHeader = (name: string) =>
          headers.find(
            (header) =>
              header.name?.toLowerCase() ===
              name.toLowerCase()
          )?.value ?? "";

        const payload = response.data.payload;

        const findTextBody = (part: any): string => {
          if (
            part.mimeType === "text/plain" &&
            part.body?.data
          ) {
            return Buffer.from(
              part.body.data,
              "base64url"
            ).toString("utf-8");
          }

          if (part.parts) {
            for (const child of part.parts) {
              const result = findTextBody(child);

              if (result) {
                return result;
              }
            }
          }

          return "";
        };

        const findHtmlBody = (part: any): string => {
          if (
            part.mimeType === "text/html" &&
            part.body?.data
          ) {
            return Buffer.from(
              part.body.data,
              "base64url"
            ).toString("utf-8");
          }

          if (part.parts) {
            for (const child of part.parts) {
              const result = findHtmlBody(child);

              if (result) {
                return result;
              }
            }
          }

          return "";
        };

        let body = findTextBody(payload);

        if (!body) {
          const htmlBody = findHtmlBody(payload);

          body = htmlBody
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(
              /&#(\d+);/g,
              (_, code) =>
                String.fromCharCode(Number(code))
            )
            .replace(
              /&#x([0-9a-f]+);/gi,
              (_, code) =>
                String.fromCharCode(
                  parseInt(code, 16)
                )
            )
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/\uFEFF/g, "")
            .replace(/\s+/g, " ")
            .trim();
        }

        return {
          id: message.id,
          from: getHeader("From"),
          subject: getHeader("Subject"),
          date: getHeader("Date"),
          body,
          starred:
            response.data.labelIds?.includes("STARRED") ??
            false,
          unread:
            response.data.labelIds?.includes("UNREAD") ??
            false,
        };
      })
    );

    return Response.json({
      messages: emailDetails,
    });
  } catch (error) {
    console.error("Gmail fetch error:", error);

    return Response.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}