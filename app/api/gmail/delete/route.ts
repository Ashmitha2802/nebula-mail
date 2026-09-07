import { google } from "googleapis";
import { auth } from "@/auth";

export async function DELETE(request: Request) {
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

    await gmail.users.messages.trash({
      userId: "me",
      id,
    });

    return Response.json({
      success: true,
      message: "Email moved to trash",
    });
  } catch (error) {
    console.error("Delete email error:", error);

    return Response.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}