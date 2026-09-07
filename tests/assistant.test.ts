import { describe, expect, it } from "vitest";

import { POST } from "../app/api/ai/assistant/route";

async function callAssistant(body: unknown) {
  const request = new Request("http://localhost/api/ai/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return POST(request);
}

describe("NebulaMail AI Assistant", () => {
  it("should open compose for a compose command", async () => {
    const response = await callAssistant({
      command: "compose",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.action).toBe("OPEN_COMPOSE");
  });

  it("should create a send-email action", async () => {
    const response = await callAssistant({
      command:
        "send email to john@example.com saying Hello John",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.action).toBe("SEND_EMAIL");
    expect(data.recipient).toBe("john@example.com");
    expect(data.body).toBe("Hello John");
  });

  it("should create a reply action", async () => {
    const response = await callAssistant({
      command: "reply saying Thank you for the update",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.action).toBe("REPLY_EMAIL");
    expect(data.body).toBe("Thank you for the update");
  });

  it("should filter unread emails", async () => {
    const response = await callAssistant({
      command: "show unread emails",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("FILTER_EMAILS");
    expect(data.filterType).toBe("unread");
  });

  it("should filter starred emails", async () => {
    const response = await callAssistant({
      command: "show starred emails",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("FILTER_EMAILS");
    expect(data.filterType).toBe("starred");
  });

  it("should detect recent-email requests", async () => {
    const response = await callAssistant({
      command: "show emails from the last 7 days",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("FILTER_EMAILS");
    expect(data.filterType).toBe("recent");
    expect(data.filterValue).toBe("7");
  });

  it("should detect keyword email searches", async () => {
    const response = await callAssistant({
      command: "show linkedin emails",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("FILTER_EMAILS");
    expect(data.filterType).toBe("subject");
    expect(data.filterValue).toBe("linkedin");
  });

  it("should detect summarize requests", async () => {
    const response = await callAssistant({
      command: "summarize this email",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("SUMMARIZE_EMAIL");
  });

  it("should detect questions about the current email", async () => {
    const response = await callAssistant({
      command: "what is this email about?",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(data.action).toBe("ASK_ABOUT_EMAIL");
    expect(data.question).toBe("what is this email about?");
  });

  it("should reject an empty command", async () => {
    const response = await callAssistant({
      command: "",
      emails: [],
      currentEmail: null,
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Command is required");
  });
});
it("should create a forward action", async () => {
  const response = await callAssistant({
    command: "forward this email",
    emails: [],
    currentEmail: null,
  });

  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.action).toBe("FORWARD_EMAIL");
});