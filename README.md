NebulaMail

NebulaMail is an AI-powered Gmail client built with Next.js, Google OAuth, the Gmail API, and a local Ollama LLM. It combines everyday email operations with a natural-language assistant that can control the inbox, prepare messages and replies, summarize emails, extract key points and action items, classify priority and category, and perform semantic email search.

The main goal of NebulaMail is to demonstrate a practical full-stack AI application where AI output is connected to real UI state and real Gmail actions instead of behaving like a standalone chatbot.

Features

Gmail and Authentication

Google OAuth sign-in and sign-out

Gmail API integration

Inbox, Starred, and Trash folders

Real Gmail message data

Read / unread handling

Star / unstar

Delete by moving messages to Gmail Trash

Compose and send email

Reply to the currently opened email

Automatic recipient extraction for replies

Automatic Re: subject handling

Send confirmation before calling the Gmail send API

AI Email Intelligence

AI email summaries

Key points extraction

Action-item extraction

Ask AI questions about an open email

AI-generated replies

Reply tone selection:

Professional

Friendly

Short

Smart priority classification:

High

Medium

Low

Smart category classification:

Work

Internship

Education

Finance

Shopping

Promotion

Personal

Other

Natural-language semantic email search

Central AI Assistant

NebulaMail includes a single assistant panel that can control the application through natural language.

Examples:

Show unread emails
Show emails from the last 10 days
Show LinkedIn emails
Show IDP mails
Send an email to john@example.com saying hello
Compose a new email
Reply to this email saying I'll join the meeting
Summarize this email

Assistant actions are connected to actual React UI state. For example, a send command opens Compose with fields populated, while a filter command updates the displayed inbox results.

Real-Time Sync

NebulaMail performs a silent background Gmail refresh every 20 seconds while authenticated. This allows new messages to appear without requiring the user to press Refresh manually.

Rich Assistant Previews

Natural-language filtering can display matching email previews inside the assistant panel. Each preview shows the sender, subject, and a short body preview, and can be clicked to open the full email.

Technology Stack

Layer

Technology

Frontend

Next.js 16, React 19, TypeScript

Styling

Tailwind CSS

Authentication

Auth.js / NextAuth + Google OAuth

Email

Gmail API

AI

Ollama + qwen2.5:3b

Runtime

Node.js

Version Control

Git + GitHub

Architecture

Browser
  |
  v
Next.js App Router
  |
  +------------------------+
  |                        |
  v                        v
Google OAuth          AI Assistant UI
  |                        |
  v                        v
Gmail API              AI API Routes
                           |
                           v
                     Ollama / qwen2.5:3b

Request Flow

The user signs in with Google.

Auth.js obtains Google OAuth credentials with Gmail scopes.

The app stores the access token and refresh token in the server-side session/JWT flow.

Gmail API routes use the authenticated access token to read or modify mail.

AI routes send email context or user commands to Ollama.

AI results are converted into application actions or displayed insights.

The frontend updates real UI state such as filters, compose fields, replies, and previews.

Project Structure

ai-mail-app/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── ask/route.ts
│   │   │   ├── assistant/route.ts
│   │   │   ├── insights/route.ts
│   │   │   ├── priority/route.ts
│   │   │   ├── reply/route.ts
│   │   │   ├── search/route.ts
│   │   │   └── summarize/route.ts
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── gmail/
│   │       ├── delete/route.ts
│   │       ├── read/route.ts
│   │       ├── send/route.ts
│   │       ├── star/route.ts
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── types/
│   └── next-auth.d.ts
├── auth.ts
├── .env.local
├── package.json
└── README.md

Prerequisites

Install the following before running the project:

Node.js 18+

npm

A Google account

A Google Cloud project with Gmail API enabled

Ollama installed locally

Git (optional, for version control)

Google Cloud Setup

1. Create a Google Cloud Project

Create a project in Google Cloud Console.

2. Enable Gmail API

Open APIs & Services → Library, search for Gmail API, and enable it.

3. Configure OAuth Consent Screen

Configure the Google OAuth consent screen and add the test account when using the app in testing mode.

4. Create OAuth Credentials

Create an OAuth Client ID for a web application.

For local development, use:

Authorized JavaScript origin:
http://localhost:3000

Authorized redirect URI:
http://localhost:3000/api/auth/callback/google

5. Gmail Scopes

NebulaMail requests these Gmail permissions:

https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify

These permissions support reading messages, sending mail, marking messages read/unread, starring, and moving messages to Trash.

Environment Variables

Create a .env.local file in the project root.

Example:

AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_long_random_auth_secret

Do not commit .env.local or OAuth secrets to GitHub.

If your existing Auth.js configuration uses a different variable name, keep the names consistent with auth.ts.

Install Dependencies

From the project root:

npm install

Ollama Setup

NebulaMail uses a local Ollama model so the AI features can run without paid OpenAI API usage.

Install Ollama, then download the model:

ollama pull qwen2.5:3b

Start a model session when needed:

ollama run qwen2.5:3b

The application calls the local Ollama API at:

http://localhost:11434/api/generate

No OpenAI API key is required for the current implementation.

Run the Application

Start the development server:

npm run dev

Open:

http://localhost:3000

Sign in with Google and grant the requested Gmail permissions.

AI Assistant Behavior

The central assistant uses a hybrid approach:

Common high-confidence commands are detected directly in the application/API layer.

Commands that do not match the known patterns are sent to Ollama for intent classification.

The returned action is mapped to real application behavior.

Supported action types include:

SEND_EMAIL
REPLY_EMAIL
FILTER_EMAILS
SUMMARIZE_EMAIL
ASK_ABOUT_EMAIL
OPEN_COMPOSE
NONE

Example flow:

User:
"Send an email to john@example.com saying hello"

Assistant:
SEND_EMAIL

UI:
Opens Compose
To: john@example.com
Body: hello

API Routes

Authentication

GET/POST /api/auth/[...nextauth]

Handles Google OAuth and Auth.js session management.

Gmail

GET    /api/gmail
DELETE /api/gmail/delete
POST   /api/gmail/read
POST   /api/gmail/send
POST   /api/gmail/star

AI

POST /api/ai/ask
POST /api/ai/assistant
POST /api/ai/insights
POST /api/ai/priority
POST /api/ai/reply
POST /api/ai/search
POST /api/ai/summarize

Authentication and Token Refresh

Google access tokens are short-lived, so NebulaMail stores the OAuth refresh token in the Auth.js JWT flow and refreshes the access token when it expires.

The refresh flow:

Google login
    |
    v
Access token + Refresh token
    |
    v
Access token expires
    |
    v
Google token endpoint
    |
    v
New access token

This prevents normal Gmail operations from failing simply because the original access token expired.

If an existing Google account was previously authorized during testing and a fresh refresh token is required, remove the application's access from the Google account and sign in again.

Real-Time Sync

The inbox performs silent polling every 20 seconds:

Authenticated user
       |
       v
20-second interval
       |
       v
GET /api/gmail
       |
       v
Update email state

The polling request uses a silent mode so it does not show the loading screen on every background refresh.

Security Notes

OAuth client secrets must remain server-side.

.env.local must never be committed.

Gmail access tokens should never be logged or exposed in the client.

API routes verify authentication before performing Gmail operations.

User-controlled email content is passed to the model as context and prompts instruct the model not to invent facts.

Assistant-generated replies are displayed for user review before sending.

Email sending requires explicit confirmation.

Engineering Trade-Offs

Local Ollama instead of a hosted AI API

Using Ollama keeps AI usage free and local during development. The trade-off is that the AI server must be reachable from the application runtime.

For local development:

Next.js -> localhost:11434 -> Ollama

For a cloud deployment, localhost:11434 would refer to the cloud server rather than the developer's computer. A publicly reachable inference service or a separately hosted model would therefore be required for production AI features.

Hybrid Assistant Intent Detection

The assistant currently uses deterministic pattern matching for common commands before falling back to the LLM. This makes tested actions more predictable with a small local model, but unusual phrasing may not behave like a completely free-form agent.

Client-Side Filtering

Natural-language filtering currently works over the emails loaded into the client. This keeps the implementation simple, but it means the result set is limited by how many messages the Gmail route currently fetches.

Known Limitations

Inbox retrieval is currently limited to a small number of messages and does not implement full pagination.

The natural-language assistant intentionally prioritizes a set of common command patterns for reliability.

The local Ollama setup is best suited for local development unless the model service is deployed separately.

Gmail and OAuth behavior still depends on Google account permissions and API availability.

Testing Checklist

Authentication

Google sign-in works

Google sign-out works

Gmail permissions are granted

Expired access tokens refresh correctly

Gmail

Inbox loads real emails

Star / unstar works

Read / unread works

Delete moves mail to Trash

Trash folder works

Compose works

Send works

Send confirmation appears

Reply works

AI

AI Summary works

Key Points & Action Items work

Ask AI works

AI Reply works

Professional / Friendly / Short tones work

Priority & Category work

AI Search works

Central Assistant works

Natural-language filters update the inbox

Assistant reply uses the currently opened email

Assistant email previews open the correct email

Reliability

Background polling updates the inbox without a spinner flash

Manual Refresh still shows the loading state

Production build succeeds

Production Build

Run:

npm run build

Start the production build locally with:

npm start

Note: the current AI implementation depends on a local Ollama endpoint, so production deployment requires a separately reachable AI service if AI functionality must remain available outside the development machine.

Screenshots and Demo

Add screenshots or a demo link here when publishing the project.

Suggested screenshots:

Main inbox

Email detail view

Central AI Assistant

AI summary / insights

AI-generated reply

Natural-language filtering with email previews

Compose confirmation dialog

Example placeholder:

/screenshots/inbox.png
/screenshots/assistant.png
/screenshots/ai-reply.png

Future Improvements

Gmail pagination and infinite scrolling

Server-side Gmail search for larger mailboxes

More flexible natural-language command handling

Thread-aware conversations

Conversation history for the assistant

Attachments and rich HTML email composition

Labels and custom folders

Production-hosted inference service

Streaming AI responses

Better email ranking and priority automation

Push-based Gmail updates instead of polling

License

This project is intended as a learning and portfolio application. Add a formal open-source license here if you plan to distribute the repository publicly.

Built with Next.js + Google OAuth + Gmail API + Ollama.
