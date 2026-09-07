import { google } from "googleapis";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.accessToken) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json(
        { error: "Email ID is required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    await gmail.users.messages.modify({
      userId: "me",
      id,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    return Response.json({
      success: true,
      message: "Email marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);

    return Response.json(
      { error: "Failed to mark email as read" },
      { status: 500 }
    );
  }
}