"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type Email = {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  starred: boolean;
  unread: boolean;
};

// =====================================================
// ICONS (inline SVG, no extra dependency)
// =====================================================

function Icon({
  path,
  className = "w-4 h-4",
  filled = false,
}: {
  path: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const paths = {
  mail: "M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z",
  inbox:
    "M4 12h4l2 3h4l2-3h4M4 12V6a1 1 0 011-1h14a1 1 0 011 1v6M4 12v6a1 1 0 001 1h14a1 1 0 001-1v-6",
  star: "M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2-4.8-4.3 6.4-.6L12 3z",
  trash:
    "M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h6a1 1 0 001-1V7M10 11v6M14 11v6",
  compose: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3",
  refresh:
    "M4 4v5h5M20 20v-5h-5M4.6 15A8 8 0 0019 9M19.4 9A8 8 0 005 15",
  back: "M15 18l-6-6 6-6",
  bot: "M12 8V4m-3 4h6a3 3 0 013 3v3a3 3 0 01-3 3H9a3 3 0 01-3-3v-3a3 3 0 013-3zm-1 6h.01M14 14h.01M4 12H2m20 0h-2",
  reply: "M9 14l-5-5 5-5M4 9h9a7 7 0 017 7v2",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  sparkles:
    "M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3zM5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7L5 15zM18 14l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8.8-2.4z",
  target:
    "M12 21a9 9 0 100-18 9 9 0 000 18zM12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z",
  brain:
    "M9 4a3 3 0 00-3 3v1a3 3 0 00-2 2.8V13a3 3 0 002 2.8v1A3 3 0 009 20h1V4H9zm6 0h-1v16h1a3 3 0 003-3.2v-1a3 3 0 002-2.8v-2.2a3 3 0 00-2-2.8V7a3 3 0 00-3-3z",
  close: "M6 6l12 12M18 6L6 18",
  logout:
    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  ask: "M12 18h.01M9.5 9a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4",
};

// =====================================================
// COMPONENT
// =====================================================

export default function Home() {
  const { data: session, status } = useSession();

  // ---------------- EMAIL STATES ----------------

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const [activeFolder, setActiveFolder] = useState("Inbox");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- AI SEARCH ----------------

  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Email[]>([]);

  // ---------------- COMPOSE / REPLY ----------------

  const [showCompose, setShowCompose] = useState(false);
  const [replyMode, setReplyMode] = useState(false);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // ---------------- AI SUMMARY ----------------

  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ---------------- AI INSIGHTS ----------------

  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ---------------- ASK AI ----------------

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);

  // ---------------- AI REPLY ----------------

  const [replyLoading, setReplyLoading] = useState(false);
  const [tone, setTone] = useState("professional");

  // ---------------- PRIORITY ----------------

  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [priorityReason, setPriorityReason] = useState("");
  const [priorityLoading, setPriorityLoading] = useState(false);

  // ---------------- CENTRAL AI ASSISTANT ----------------

  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [assistantMessages, setAssistantMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: 'Hi! I can control NebulaMail. Try: "show unread emails" or "send an email to john@example.com saying hello".',
    },
  ]);

  const [assistantFilteredEmails, setAssistantFilteredEmails] = useState<
    Email[] | null
  >(null);

  const [assistantEmailPreviews, setAssistantEmailPreviews] = useState<
    Email[] | null
  >(null);

  // =====================================================
  // FETCH EMAILS
  // silent = true → background/polling refresh, no spinner, no alerts
  // =====================================================

  const fetchEmails = async (folder = activeFolder, silent = false) => {
    if (!silent) setLoading(true);

    try {
      let folderParam = "inbox";

if (folder === "Trash") folderParam = "trash";
if (folder === "Starred") folderParam = "starred";
if (folder === "Sent") folderParam = "sent";

      const response = await fetch(`/api/gmail?folder=${folderParam}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) return;
        if (!silent) alert(data.error || "Failed to fetch emails");
        return;
      }

      setEmails(data.messages ?? []);
    } catch (error) {
      console.error("Fetch emails error:", error);
      if (!silent) alert("Failed to fetch emails");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // =====================================================
  // LOAD INBOX ON LOGIN
  // =====================================================

  useEffect(() => {
    if (status === "authenticated") {
      fetchEmails("Inbox");
    }
  }, [status]);

  // =====================================================
  // REAL-TIME SYNC — silent background poll every 20s
  // =====================================================

  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(() => {
      fetchEmails(activeFolder, true);
    }, 20000);

    return () => clearInterval(interval);
  }, [status, activeFolder]);

  // =====================================================
  // CHANGE FOLDER
  // =====================================================

  const changeFolder = (folder: string) => {
    setActiveFolder(folder);
    setSelectedEmail(null);

    setSearch("");

    setAiSearchActive(false);
    setAiSearchResults([]);
    setAssistantFilteredEmails(null);

    setAiSummary("");
    setKeyPoints([]);
    setActionItems([]);
    setAiAnswer("");

    setPriority("");
    setCategory("");
    setPriorityReason("");

    fetchEmails(folder);
  };

  // =====================================================
  // DELETE EMAIL
  // =====================================================

  const deleteEmail = async (id: string) => {
    try {
      const response = await fetch("/api/gmail/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete email");
        return;
      }

      setEmails((prev) => prev.filter((email) => email.id !== id));
      setAiSearchResults((prev) => prev.filter((email) => email.id !== id));

      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete email");
    }
  };

  // =====================================================
  // STAR / UNSTAR
  // =====================================================

  const toggleStar = async (email: Email) => {
    try {
      const response = await fetch("/api/gmail/star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id, starred: email.starred }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update star");
        return;
      }

      setEmails((prev) =>
        prev.map((item) =>
          item.id === email.id ? { ...item, starred: data.starred } : item
        )
      );

      setAiSearchResults((prev) =>
        prev.map((item) =>
          item.id === email.id ? { ...item, starred: data.starred } : item
        )
      );

      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...email, starred: data.starred });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update star");
    }
  };

  // =====================================================
  // OPEN EMAIL
  // =====================================================

  const openEmail = async (email: Email) => {
    setSelectedEmail(email);

    setAiSummary("");
    setKeyPoints([]);
    setActionItems([]);
    setAiAnswer("");

    setPriority("");
    setCategory("");
    setPriorityReason("");

    if (activeFolder !== "Trash" && email.unread) {
      try {
        await fetch("/api/gmail/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: email.id }),
        });

        setEmails((prev) =>
          prev.map((item) =>
            item.id === email.id ? { ...item, unread: false } : item
          )
        );
      } catch (error) {
        console.error("Mark read error:", error);
      }
    }
  };

  // =====================================================
  // COMPOSE
  // =====================================================

  const openCompose = () => {
    setReplyMode(false);
    setTo("");
    setSubject("");
    setBody("");
    setShowCompose(true);
  };

  // =====================================================
  // REPLY
  // =====================================================

  const openReply = () => {
    if (!selectedEmail) return;

    const emailMatch = selectedEmail.from.match(/<([^>]+)>/);
    const emailAddress = emailMatch ? emailMatch[1] : selectedEmail.from;

    const replySubject = selectedEmail.subject.toLowerCase().startsWith("re:")
      ? selectedEmail.subject
      : `Re: ${selectedEmail.subject}`;

    setTo(emailAddress);
    setSubject(replySubject);
    setBody("");

    setReplyMode(true);
    setShowCompose(true);
  };

  // =====================================================
  // CLOSE COMPOSE
  // =====================================================

  const closeCompose = () => {
    setShowCompose(false);
    setReplyMode(false);
    setTo("");
    setSubject("");
    setBody("");
  };

  // =====================================================
  // SEND EMAIL (with confirmation)
  // =====================================================

  const sendEmail = async () => {
    if (!to || !subject || !body) {
      alert("Please fill To, Subject and Body");
      return;
    }

    const confirmed = window.confirm(
      `Send this email to ${to}?\n\nSubject: ${subject}`
    );

    if (!confirmed) return;

    setSending(true);

    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to send email");
        return;
      }

      alert(replyMode ? "Reply sent successfully!" : "Email sent successfully!");
      closeCompose();
    } catch (error) {
      console.error(error);
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // AI SUMMARY
  // =====================================================

  const generateSummary = async () => {
    if (!selectedEmail) return;

    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to generate summary");
        return;
      }

      setAiSummary(data.summary || "");
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI summary");
    } finally {
      setAiLoading(false);
    }
  };

  // =====================================================
  // AI INSIGHTS
  // =====================================================

  const generateInsights = async () => {
    if (!selectedEmail) return;

    setInsightsLoading(true);

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to analyze email");
        return;
      }

      setKeyPoints(data.keyPoints || []);
      setActionItems(data.actionItems || []);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze email");
    } finally {
      setInsightsLoading(false);
    }
  };

  // =====================================================
  // ASK AI
  // =====================================================

  const askAI = async () => {
    if (!selectedEmail || !question.trim()) return;

    setAskLoading(true);

    try {
      const response = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to ask AI");
        return;
      }

      setAiAnswer(data.answer || "");
    } catch (error) {
      console.error(error);
      alert("Failed to ask AI");
    } finally {
      setAskLoading(false);
    }
  };

  // =====================================================
  // AI REPLY
  // =====================================================

  const generateReply = async (selectedTone = tone) => {
    if (!selectedEmail) return;

    setReplyLoading(true);

    try {
      const response = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
          instruction: "Write a suitable reply to this email.",
          tone: selectedTone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to generate reply");
        return;
      }

      const emailMatch = selectedEmail.from.match(/<([^>]+)>/);
      const emailAddress = emailMatch ? emailMatch[1] : selectedEmail.from;

      const replySubject = selectedEmail.subject.toLowerCase().startsWith("re:")
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`;

      setTo(emailAddress);
      setSubject(replySubject);
      setBody(data.reply || "");

      setReplyMode(true);
      setShowCompose(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI reply");
    } finally {
      setReplyLoading(false);
    }
  };

  // =====================================================
  // SMART PRIORITY
  // =====================================================

  const analyzePriority = async () => {
    if (!selectedEmail) return;

    setPriorityLoading(true);

    try {
      const response = await fetch("/api/ai/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to classify email");
        return;
      }

      setPriority(data.priority || "");
      setCategory(data.category || "");
      setPriorityReason(data.reason || "");
    } catch (error) {
      console.error(error);
      alert("Failed to classify email");
    } finally {
      setPriorityLoading(false);
    }
  };

  // =====================================================
  // AI SEARCH
  // =====================================================

  const performAISearch = async () => {
    if (!search.trim()) {
      alert("Please enter a search query");
      return;
    }

    if (emails.length === 0) {
      alert("No emails available");
      return;
    }

    setAiSearchLoading(true);

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search, emails }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "AI search failed");
        return;
      }

      const matchingEmails = emails.filter((email) =>
        data.matchingIds?.includes(email.id)
      );

      setAiSearchResults(matchingEmails);
      setAiSearchActive(true);
    } catch (error) {
      console.error("AI search error:", error);
      alert("Failed to perform AI search");
    } finally {
      setAiSearchLoading(false);
    }
  };

  // =====================================================
  // CLEAR AI SEARCH
  // =====================================================

  const clearAISearch = () => {
    setSearch("");
    setAiSearchActive(false);
    setAiSearchResults([]);
  };

  // =====================================================
  // CENTRAL AI ASSISTANT
  // =====================================================

  const executeAssistantCommand = async (command: string) => {
    const response = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, emails, currentEmail: selectedEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Assistant request failed");
    }

    const action = data.action;

    if (action === "SEND_EMAIL") {
      setReplyMode(false);
      setTo(data.recipient || "");
      setSubject(data.subject || "");
      setBody(data.body || "");
      setShowCompose(true);

      return data.recipient
        ? `Opening compose with ${data.recipient}.`
        : "Opening compose.";
    }

    if (action === "OPEN_COMPOSE") {
      setReplyMode(false);
      setTo("");
      setSubject("");
      setBody("");
      setShowCompose(true);

      return "Opening compose.";
    }

    if (action === "REPLY_EMAIL") {
      if (!selectedEmail) {
        return "Please open an email first, then ask me to reply to it.";
      }

      const emailMatch = selectedEmail.from.match(/<([^>]+)>/);
      const emailAddress = emailMatch ? emailMatch[1] : selectedEmail.from;

      const replySubject = selectedEmail.subject.toLowerCase().startsWith("re:")
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`;

      setTo(emailAddress);
      setSubject(replySubject);
      setBody(data.body || "");
      setReplyMode(true);
      setShowCompose(true);

      return "Opening a reply to the current email.";
    }
    if (action === "FORWARD_EMAIL") {
  if (!selectedEmail) {
    return "Please open an email first, then ask me to forward it.";
  }

  setReplyMode(false);
  setTo("");
  setSubject(`Fwd: ${selectedEmail.subject}`);
  setBody(
    data.body
      ? `${data.body}\n\n--- Forwarded message ---\n${selectedEmail.body}`
      : `\n\n--- Forwarded message ---\n${selectedEmail.body}`
  );
  setShowCompose(true);

  return "Opening the forwarded email.";
}

    if (action === "FILTER_EMAILS") {
      const type = data.filterType;
      const value = String(data.filterValue || "");

      setSelectedEmail(null);
      setSearch("");
      setAiSearchActive(false);
      setAiSearchResults([]);

      if (type === "all") {
        setAssistantFilteredEmails(null);
        setAssistantEmailPreviews(null);
        return "Showing all emails.";
      }

      let filtered: Email[] = [];

      if (type === "unread") {
        filtered = emails.filter((email) => email.unread);
      } else if (type === "starred") {
        filtered = emails.filter((email) => email.starred);
      } else if (type === "sender") {
        filtered = emails.filter((email) =>
          email.from.toLowerCase().includes(value.toLowerCase())
        );
      } else if (type === "subject") {
        filtered = emails.filter((email) =>
          email.subject.toLowerCase().includes(value.toLowerCase())
        );
      } else if (type === "recent") {
        const days = Number(value) || 7;
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

        filtered = emails.filter((email) => {
          const time = Date.parse(email.date);
          return !Number.isNaN(time) && time >= cutoff;
        });
      }

      setAssistantFilteredEmails(filtered);
      setAssistantEmailPreviews(filtered.slice(0, 5));

      return `Showing ${filtered.length} matching email${
        filtered.length === 1 ? "" : "s"
      }.`;
    }

    if (action === "SUMMARIZE_EMAIL") {
      if (!selectedEmail) {
        return "Please open an email first so I can summarize it.";
      }

      await generateSummary();
      return "I generated a summary for the current email.";
    }

    if (action === "ASK_ABOUT_EMAIL") {
      if (!selectedEmail) {
        return "Please open an email first so I can answer questions about it.";
      }

      const assistantQuestion = command;
      setQuestion(assistantQuestion);

      const askResponse = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: assistantQuestion,
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          body: selectedEmail.body,
        }),
      });

      const answerData = await askResponse.json();

      if (!askResponse.ok) {
        throw new Error(answerData.error || "Failed to ask AI");
      }

      setAiAnswer(answerData.answer || "");
      return "I answered your question about the current email.";
    }

    return "I understood the command, but there is no UI action for it yet.";
  };

  const sendAssistantCommand = async () => {
    const command = assistantInput.trim();

    if (!command || assistantLoading) return;

    setAssistantMessages((prev) => [...prev, { role: "user", text: command }]);
    setAssistantInput("");
    setAssistantLoading(true);

    try {
      const result = await executeAssistantCommand(command);

      setAssistantMessages((prev) => [
        ...prev,
        { role: "assistant", text: result },
      ]);
    } catch (error) {
      console.error("Assistant error:", error);

      setAssistantMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I could not complete that command." },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
          <span className="text-sm">Loading NebulaMail…</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
          <div className="mx-auto mb-5 h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Icon path={paths.mail} className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">NebulaMail</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your inbox, guided by an AI assistant
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white text-sm font-medium py-3 hover:bg-slate-800 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // SEARCH / DISPLAY LISTS
  // =====================================================

  const normalSearchResults = emails.filter((email) => {
    if (!search.trim()) return true;

    const searchText = search.toLowerCase();

    return (
      email.from.toLowerCase().includes(searchText) ||
      email.subject.toLowerCase().includes(searchText) ||
      email.body.toLowerCase().includes(searchText)
    );
  });

  const displayedEmails =
    assistantFilteredEmails !== null
      ? assistantFilteredEmails
      : aiSearchActive
      ? aiSearchResults
      : normalSearchResults;

  const priorityStyles: Record<string, string> = {
    High: "bg-rose-50 text-rose-700 border border-rose-200",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= TOP BAR ================= */}

      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2 min-w-[160px]">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Icon path={paths.mail} className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900">NebulaMail</span>
        </div>

        <div className="flex-1 max-w-2xl relative">
          <Icon
            path={paths.search}
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setAssistantFilteredEmails(null);

              if (aiSearchActive) {
                setAiSearchActive(false);
                setAiSearchResults([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") performAISearch();
            }}
            placeholder="Search emails, or ask naturally…"
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-colors"
          />
        </div>

        <button
          onClick={performAISearch}
          disabled={aiSearchLoading}
          className="h-10 px-4 rounded-lg bg-violet-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-violet-700 transition-colors inline-flex items-center gap-2"
        >
          <Icon path={paths.sparkles} className="w-4 h-4" />
          {aiSearchLoading ? "Searching…" : "AI Search"}
        </button>

        <button
          onClick={handleLogout}
          className="h-10 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
        >
          <Icon path={paths.logout} className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* ================= SIDEBAR ================= */}

        <aside className="w-60 bg-white border-r border-slate-200 p-5 flex-shrink-0 flex flex-col">
          <button
            onClick={openCompose}
            className="w-full mb-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-medium py-3 hover:bg-indigo-700 transition-colors"
          >
            <Icon path={paths.compose} className="w-4 h-4" />
            Compose
          </button>

          <nav className="space-y-1">
            {[
  { key: "Inbox", icon: paths.inbox, label: "Inbox" },
  { key: "Sent", icon: paths.send, label: "Sent" },
  { key: "Starred", icon: paths.star, label: "Starred" },
  { key: "Trash", icon: paths.trash, label: "Trash" },
].map((item) => (
              <button
                key={item.key}
                onClick={() => changeFolder(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeFolder === item.key
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon path={item.icon} className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setAssistantOpen((prev) => !prev)}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-sm font-medium py-2.5 hover:bg-violet-100 transition-colors"
          >
            <Icon path={paths.bot} className="w-4 h-4" />
            {assistantOpen ? "Hide Assistant" : "AI Assistant"}
          </button>

          <div className="mt-auto pt-5 border-t border-slate-100 text-xs text-slate-400 truncate">
            {session?.user?.email}
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}

        <main className="flex-1 min-w-0 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {aiSearchActive ? `AI Search: "${search}"` : activeFolder}
              </h2>

              {aiSearchActive && (
                <button
                  onClick={clearAISearch}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md hover:bg-rose-100 transition-colors"
                >
                  <Icon path={paths.close} className="w-3 h-3" />
                  Clear AI search
                </button>
              )}
            </div>

            <button
              onClick={() => fetchEmails(activeFolder)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Icon path={paths.refresh} className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center text-sm text-slate-500">
              Loading emails…
            </div>
          ) : selectedEmail ? (
            /* ================= EMAIL DETAIL ================= */
            <div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="mb-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Icon path={paths.back} className="w-4 h-4" />
                Back
              </button>

              <div className="bg-white rounded-xl border border-slate-200 p-7">
                <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <div className="text-sm text-slate-500">
                      From <span className="text-slate-700 font-medium">{selectedEmail.from}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 whitespace-nowrap">
                    {selectedEmail.date}
                  </div>
                </div>

                <div className="py-6 text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => toggleStar(selectedEmail)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Icon
                      path={paths.star}
                      filled={selectedEmail.starred}
                      className={`w-4 h-4 ${
                        selectedEmail.starred ? "text-amber-400" : "text-slate-400"
                      }`}
                    />
                    {selectedEmail.starred ? "Unstar" : "Star"}
                  </button>

                  <button
                    onClick={generateSummary}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-violet-700 transition-colors"
                  >
                    <Icon path={paths.sparkles} className="w-4 h-4" />
                    {aiLoading ? "Thinking…" : "AI Summary"}
                  </button>

                  <button
                    onClick={generateInsights}
                    disabled={insightsLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-cyan-700 transition-colors"
                  >
                    <Icon path={paths.target} className="w-4 h-4" />
                    {insightsLoading ? "Analyzing…" : "Key Points & Actions"}
                  </button>

                  <button
                    onClick={analyzePriority}
                    disabled={priorityLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-60 hover:bg-slate-800 transition-colors"
                  >
                    <Icon path={paths.brain} className="w-4 h-4" />
                    {priorityLoading ? "Analyzing…" : "Priority & Category"}
                  </button>

                  <button
                    onClick={() => generateReply("professional")}
                    disabled={replyLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-indigo-700 transition-colors"
                  >
                    <Icon path={paths.sparkles} className="w-4 h-4" />
                    {replyLoading ? "Generating…" : "Generate AI Reply"}
                  </button>

                  <button
                    onClick={openReply}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Icon path={paths.reply} className="w-4 h-4" />
                    Reply
                  </button>

                  <button
                    onClick={() => deleteEmail(selectedEmail.id)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition-colors"
                  >
                    <Icon path={paths.trash} className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                {aiSummary && (
                  <div className="mt-5 p-5 rounded-xl bg-violet-50 border border-violet-100">
                    <h3 className="text-sm font-semibold text-violet-800 mb-2">
                      AI Summary
                    </h3>
                    <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  </div>
                )}

                {keyPoints.length > 0 && (
                  <div className="mt-5 p-5 rounded-xl bg-cyan-50 border border-cyan-100">
                    <h3 className="text-sm font-semibold text-cyan-800 mb-2">
                      Key Points
                    </h3>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                      {keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>

                    <h3 className="text-sm font-semibold text-cyan-800 mt-4 mb-2">
                      Action Items
                    </h3>
                    {actionItems.length === 0 ? (
                      <p className="text-sm text-slate-500">No action items found.</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                        {actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {(priority || category) && (
                  <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      Priority & Category
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {priority && (
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                            priorityStyles[priority] ??
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {priority} priority
                        </span>
                      )}

                      {category && (
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {category}
                        </span>
                      )}
                    </div>

                    {priorityReason && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">Why: </span>
                        {priorityReason}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  <div className="relative flex-1">
                    <Icon
                      path={paths.ask}
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") askAI();
                      }}
                      placeholder="Ask AI about this email…"
                      className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>

                  <button
                    onClick={askAI}
                    disabled={askLoading}
                    className="px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-indigo-700 transition-colors"
                  >
                    {askLoading ? "Thinking…" : "Ask AI"}
                  </button>
                </div>

                {aiAnswer && (
                  <div className="mt-4 p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    <span className="font-semibold text-indigo-800 block mb-1.5">
                      AI Answer
                    </span>
                    {aiAnswer}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= EMAIL LIST ================= */
            <div>
              {displayedEmails.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-20 text-center text-sm text-slate-500">
                  {aiSearchActive
                    ? "No emails matched your AI search."
                    : "No emails found."}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {displayedEmails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => openEmail(email)}
                      className={`group flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                        email.unread ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email);
                        }}
                        className="flex-shrink-0"
                      >
                        <Icon
                          path={paths.star}
                          filled={email.starred}
                          className={`w-5 h-5 ${
                            email.starred ? "text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm mb-1 truncate ${
                            email.unread ? "font-semibold text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {email.from}
                        </div>
                        <div
                          className={`text-[15px] mb-1 truncate ${
                            email.unread ? "font-semibold text-slate-900" : "font-medium text-slate-800"
                          }`}
                        >
                          {email.subject}
                        </div>
                        <div className="text-sm text-slate-400 truncate">
                          {email.body}
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {email.date}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEmail(email.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all flex-shrink-0"
                        title="Delete"
                      >
                        <Icon path={paths.trash} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= CENTRAL AI ASSISTANT ================= */}

      {assistantOpen && (
        <div className="fixed right-6 bottom-6 w-[360px] max-w-[calc(100vw-3rem)] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-xl z-[900] flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 bg-violet-50 border-b border-violet-100">
            <div className="flex items-center gap-2 font-semibold text-sm text-violet-800">
              <Icon path={paths.bot} className="w-4 h-4" />
              NebulaMail Assistant
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Control your inbox using natural language
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
            {assistantMessages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "self-end bg-indigo-600 text-white"
                    : "self-start bg-slate-100 text-slate-800"
                }`}
              >
                {message.text}
              </div>
            ))}

            {assistantLoading && (
              <div className="self-start px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm">
                Thinking…
              </div>
            )}

            {assistantEmailPreviews && assistantEmailPreviews.length > 0 && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="text-xs font-semibold text-slate-400">
                  Email previews
                </div>

                {assistantEmailPreviews.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-xs font-medium text-slate-500 truncate">
                      {email.from}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                      {email.subject || "No subject"}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {email.body || "No preview available."}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200 flex gap-2">
            <input
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendAssistantCommand();
              }}
              placeholder="Ask me to control your email…"
              className="flex-1 min-w-0 h-11 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
            />

            <button
              onClick={sendAssistantCommand}
              disabled={assistantLoading || !assistantInput.trim()}
              className={`w-11 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                assistantLoading || !assistantInput.trim()
                  ? "bg-slate-200 text-slate-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Icon path={paths.send} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= COMPOSE MODAL ================= */}

      {showCompose && (
        <div className="fixed inset-0 bg-slate-900/45 flex items-center justify-center z-[1000] px-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-7 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">
              {replyMode ? "Reply" : "Compose email"}
            </h2>

            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
              className="w-full box-border px-3.5 py-3 mb-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
            />

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full box-border px-3.5 py-3 mb-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
            />

            {replyMode && (
              <div className="mb-3">
                <div className="text-xs font-medium text-slate-500 mb-2">
                  AI reply tone
                </div>
                <div className="flex gap-2">
                  {[
                    { key: "professional", label: "Professional" },
                    { key: "friendly", label: "Friendly" },
                    { key: "short", label: "Short" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTone(t.key);
                        generateReply(t.key);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${
                        tone === t.key
                          ? "border-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email…"
              rows={10}
              className="w-full box-border px-3.5 py-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-y transition-colors"
            />

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={closeCompose}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={sendEmail}
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-indigo-700 transition-colors"
              >
                <Icon path={paths.send} className="w-4 h-4" />
                {sending ? "Sending…" : replyMode ? "Send reply" : "Send email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}