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
    const { id, starred } = await request.json();

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

    if (starred) {
      await gmail.users.messages.modify({
        userId: "me",
        id,
        requestBody: {
          removeLabelIds: ["STARRED"],
        },
      });
    } else {
      await gmail.users.messages.modify({
        userId: "me",
        id,
        requestBody: {
          addLabelIds: ["STARRED"],
        },
      });
    }

    return Response.json({
      success: true,
      starred: !starred,
    });
  } catch (error) {
    console.error("Star email error:", error);

    return Response.json(
      { error: "Failed to update star" },
      { status: 500 }
    );
  }
}