NebulaMail
NebulaMail is an AI-powered Gmail client built with Next.js, Google OAuth, the Gmail API, and a local Ollama LLM. It combines normal email operations with a natural-language assistant that can control the inbox, prepare emails and replies, summarize messages, extract key points and action items, classify priority/category, and perform semantic email search.
The project is designed as a practical full-stack AI application rather than a standalone chatbot: AI output is connected to real UI state and real Gmail actions.
---
Table of Contents
Features
Architecture
Technology Stack
Project Structure
Prerequisites
Google Cloud Setup
Environment Variables
Installation
Running the Application
Gmail Permissions
AI Setup with Ollama
How the AI Assistant Works
Core Workflows
API Routes
Authentication and Token Refresh
Real-Time Sync
Security
Engineering Trade-Offs
Known Limitations
Testing Checklist
Screenshots and Demo
Future Improvements
Troubleshooting
License
---
Features
Gmail and authentication
Google OAuth sign-in and sign-out
Gmail API integration
Inbox, Starred, and Trash folders
Real Gmail message content rather than mock data
Read/unread support
Star/unstar support
Delete messages by moving them to Gmail Trash
Manual refresh
Background inbox polling for new mail
Compose, send, and reply
Compose a new email
Send email through Gmail
Reply to the currently open message
Automatic recipient extraction
Automatic `Re:` subject handling
Send confirmation before the Gmail API is called
AI-generated replies
Reply tone selection:
Professional
Friendly
Short
AI email intelligence
AI email summaries
Key points extraction
Action-item extraction
AI question answering about the current email
Smart priority classification:
High
Medium
Low
Smart email categories:
Work
Internship
Education
Finance
Shopping
Promotion
Personal
Other
Natural-language email search
Central AI Assistant
NebulaMail includes a single assistant panel that can control the application's UI using natural-language commands.
Examples:
```text
show unread emails
```
```text
show emails from the last 10 days
```
```text
show linkedin emails
```
```text
send an email to john@example.com saying the meeting is tomorrow
```
```text
reply to this email saying I'll join the meet
```
```text
summarize this email
```
The assistant is connected to real React state. For example, a send command can open Compose with the recipient and body pre-filled, while a filter command changes the visible email list.
Rich previews
When an assistant filter returns matching messages, NebulaMail can display compact email previews containing the sender, subject, and body snippet. Selecting a preview opens the corresponding message.
---
Architecture
```text
┌──────────────────────────────┐
│          Browser             │
│       Next.js React UI       │
│                              │
│  Inbox / Compose / Assistant │
└──────────────┬───────────────┘
               │
               │ fetch()
               ▼
┌──────────────────────────────┐
│       Next.js API Routes     │
│                              │
│  /api/gmail/*                │
│  /api/ai/*                   │
│  /api/auth/*                 │
└───────┬─────────────┬────────┘
        │             │
        │             │ local HTTP
        │             ▼
        │      ┌───────────────┐
        │      │    Ollama     │
        │      │ qwen2.5:3b    │
        │      └───────────────┘
        │
        ▼
┌──────────────────────────────┐
│         Gmail API            │
│                              │
│   Read / Send / Modify       │
│   Inbox / Star / Trash       │
└──────────────────────────────┘

Google OAuth
     │
     ▼
Google authorization server
```
Request flow
Gmail operations
The browser calls a Next.js API route.
The route reads the authenticated session from `auth.ts`.
The Google access token is used to call the Gmail API.
Gmail data is returned to the browser.
AI operations
The browser sends email content or a natural-language command to an AI API route.
The route builds a constrained prompt.
Ollama runs `qwen2.5:3b` locally.
Structured JSON is returned where required.
The React application maps the result to a visible UI action.
---
Technology Stack
Layer	Technology
Frontend	Next.js + React + TypeScript
Authentication	NextAuth/Auth.js with Google provider
Email provider	Gmail API
AI runtime	Ollama
AI model	`qwen2.5:3b`
Styling	Tailwind CSS / utility classes
Runtime	Node.js
Package manager	npm
The AI path is intentionally local. This avoids requiring a paid hosted LLM API for normal development and testing.
---
Project Structure
```text
ai-mail-app/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── ask/
│   │   │   │   └── route.ts
│   │   │   ├── assistant/
│   │   │   │   └── route.ts
│   │   │   ├── insights/
│   │   │   │   └── route.ts
│   │   │   ├── priority/
│   │   │   │   └── route.ts
│   │   │   ├── reply/
│   │   │   │   └── route.ts
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   └── summarize/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── gmail/
│   │       ├── delete/
│   │       │   └── route.ts
│   │       ├── read/
│   │       │   └── route.ts
│   │       ├── send/
│   │       │   └── route.ts
│   │       ├── star/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── types/
│   └── next-auth.d.ts
├── auth.ts
├── .env.local
├── package.json
└── README.md
```
> Do not commit `.env.local` or any file containing OAuth secrets or API tokens.
---
Prerequisites
Install the following before running the project:
Node.js (LTS recommended)
npm
A Google account with Gmail access
A Google Cloud project
Google Cloud OAuth credentials
Gmail API enabled in Google Cloud
Ollama installed locally
The `qwen2.5:3b` model downloaded in Ollama
---
Google Cloud Setup
1. Create a Google Cloud project
Create a Google Cloud project for NebulaMail.
2. Enable Gmail API
In Google Cloud Console:
```text
APIs & Services → Library → Gmail API → Enable
```
3. Configure OAuth consent
Configure the Google OAuth consent screen / Google Auth Platform for the application.
4. Create an OAuth client
Create an OAuth Client ID for a web application.
For local development, use:
Authorized JavaScript origin
```text
http://localhost:3000
```
Authorized redirect URI
```text
http://localhost:3000/api/auth/callback/google
```
Use the client ID and client secret in `.env.local`.
---
Environment Variables
Create a file named `.env.local` in the project root.
Example:
```env
AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
```
Depending on the authentication configuration used in the project, you may also need the standard Auth.js/NextAuth secret configuration for your environment.
Important
Never place real secrets in:
`README.md`
Git commits
screenshots
source code
public repositories
chat messages shared with others
If a credential is accidentally exposed, revoke/rotate it immediately.
---
Installation
Clone the repository and enter the project directory:
```bash
git clone <your-repository-url>
cd ai-mail-app
```
Install dependencies:
```bash
npm install
```
---
Running the Application
Start the Next.js development server:
```bash
npm run dev
```
Open:
```text
http://localhost:3000
```
Sign in with Google and grant the requested Gmail permissions.
---
Gmail Permissions
NebulaMail uses Gmail scopes required for its email functionality.
The current OAuth configuration requests:
```text
openid
email
profile
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/gmail.modify
```
These permissions are used for:
Reading Gmail messages
Sending email
Marking messages as read
Star/unstar operations
Moving messages to Trash
Use the minimum scopes necessary when extending the application.
---
AI Setup with Ollama
NebulaMail uses a local Ollama instance instead of a paid hosted LLM API.
1. Install Ollama
Install Ollama for your operating system from the official Ollama distribution.
2. Download the model
```bash
ollama pull qwen2.5:3b
```
3. Test the model
```bash
ollama run qwen2.5:3b
```
4. Verify the local API
Ollama exposes a local API at:
```text
http://localhost:11434
```
A simple test can be made against:
```text
POST http://localhost:11434/api/generate
```
The application API routes use the same local endpoint.
Why Ollama?
No hosted LLM API cost for normal development
Email content remains local to the machine running Ollama
Easy to test offline from the external AI provider side
Useful for rapid development and experimentation
---
How the AI Assistant Works
The assistant is intentionally connected to application state rather than returning only chat text.
Command → Action model
The central assistant can produce actions such as:
```text
SEND_EMAIL
REPLY_EMAIL
FILTER_EMAILS
SUMMARIZE_EMAIL
ASK_ABOUT_EMAIL
OPEN_COMPOSE
NONE
```
The frontend converts those actions into real UI updates.
Example: send command
Input:
```text
send an email to john@example.com saying hello
```
The assistant extracts:
```json
{
  "action": "SEND_EMAIL",
  "recipient": "john@example.com",
  "subject": "",
  "body": "hello"
}
```
The UI then opens Compose with the recipient and body populated.
The email is not silently sent. The user must still click Send and confirm the action.
Example: inbox filter
Input:
```text
show unread emails
```
The assistant returns an inbox filter action and the React UI displays matching messages.
Example: current-email context
When an email is open, the selected message is passed as assistant context. This allows commands such as:
```text
reply to this email saying I'll join the meet
```
The application uses the current sender and subject to build the reply.
---
Core Workflows
Read an email
```text
Inbox → click message → message detail
```
Opening an unread message triggers the Gmail `modify` operation that removes `UNREAD` from the message.
Star a message
```text
Inbox → Star icon
```
The operation updates Gmail's `STARRED` label.
Delete a message
```text
Inbox → Delete
```
The message is moved to Gmail Trash rather than permanently deleted.
Compose and send
```text
Compose → To → Subject → Body → Send → Confirmation → Gmail API
```
AI reply
```text
Open email → Generate AI Reply → choose tone → edit if needed → Send Reply
```
Assistant filtering
```text
Assistant → natural-language command → action extraction → UI filter → matching emails
```
Assistant email preview
For filtered assistant results, up to a small number of matching emails are presented as clickable preview cards. This provides a compact way to inspect results without leaving the assistant workflow.
---
API Routes
Authentication
Route	Method	Purpose
`/api/auth/*`	GET/POST	Google authentication handled by NextAuth/Auth.js
Gmail
Route	Method	Purpose
`/api/gmail`	GET	Fetch messages for Inbox, Starred, or Trash
`/api/gmail/delete`	DELETE	Move a message to Trash
`/api/gmail/read`	POST	Mark a message as read
`/api/gmail/star`	POST	Add/remove Gmail STARRED label
`/api/gmail/send`	POST	Send a message through Gmail
AI
Route	Method	Purpose
`/api/ai/summarize`	POST	Generate an email summary
`/api/ai/insights`	POST	Extract key points and action items
`/api/ai/ask`	POST	Answer a question about an email
`/api/ai/reply`	POST	Generate a reply in a selected tone
`/api/ai/priority`	POST	Classify priority and category
`/api/ai/search`	POST	Semantically match emails to a search query
`/api/ai/assistant`	POST	Convert assistant commands into UI actions
---
Authentication and Token Refresh
Google access tokens are short-lived, so a production-quality Gmail integration needs refresh handling.
NebulaMail requests offline access and stores the Google refresh token inside the server-side authentication token flow. When the access token expires, `auth.ts` calls Google's OAuth token endpoint and obtains a fresh access token.
High-level flow:
```text
Initial Google login
        ↓
access_token + refresh_token
        ↓
Store in server-side auth token flow
        ↓
Access token expires
        ↓
Call Google token endpoint
        ↓
Receive fresh access token
        ↓
Continue Gmail API requests
```
If refresh fails, the session can expose a refresh error and the user may need to authenticate again.
Fresh consent during development
If an existing Google authorization no longer provides the expected refresh token, remove the application's access from the Google account's third-party connections and authenticate again so Google can issue fresh authorization credentials.
Do not print refresh tokens or access tokens in logs or screenshots.
---
Real-Time Sync
NebulaMail uses lightweight polling for inbox synchronization.
The client checks the current Gmail folder approximately every 20 seconds:
```text
Browser
   ↓
Every 20s
   ↓
/api/gmail
   ↓
Gmail API
   ↓
Replace current message list
```
Polling is intentionally silent so that background synchronization does not show a loading spinner every 20 seconds.
Manual Refresh remains available for an immediate explicit refresh.
This is a pragmatic approach for a small application. A production-scale mail system could use more sophisticated synchronization strategies.
---
Security
Credentials
Keep OAuth client secrets only in environment variables.
Never commit `.env.local`.
Never expose Google access tokens in browser logs, screenshots, or README files.
Revoke compromised credentials immediately.
Email content
AI routes receive email data so the local model can analyze it. When using Ollama, the model runs locally on the developer's machine rather than being sent to a third-party hosted model by the application.
Sending email
NebulaMail does not silently send an email solely because the assistant interpreted a command. The command prepares the compose form, and the user still controls the final Send action through the confirmation step.
---
Engineering Trade-Offs
1. Local LLM instead of a hosted API
Decision: Ollama + `qwen2.5:3b`
Why:
Zero recurring model API cost for local development
Simple local HTTP interface
Keeps email-analysis traffic local to the machine running Ollama
Trade-off:
A 3B local model can be less capable and less consistent than larger hosted models. Some natural-language commands may need stronger normalization or deterministic application logic.
2. Hybrid assistant intent detection
The assistant API uses application-level pattern detection for common commands and an LLM fallback for less deterministic requests.
Why:
Common operations such as send, reply, unread, starred, and recent-message filters benefit from deterministic behavior.
Trade-off:
The assistant is not a fully open-ended autonomous language interface. Unusual wording may not map to an action even though a larger language model could understand it.
For demos and testing, use natural-language phrases that are known to map to supported actions.
3. Polling instead of push/webhooks
Decision: client polling every 20 seconds
Why:
Very simple to implement
No additional infrastructure
Good enough for a small demonstration application
Trade-off:
It is not true event-driven real-time synchronization and creates periodic Gmail API requests.
4. Client-side filtering of the loaded message set
The assistant can filter the messages already loaded in the current client state.
Why:
Simple and responsive for a demonstration.
Trade-off:
The Gmail route currently fetches a limited number of messages, so a query may not discover messages outside the loaded set.
5. Gmail HTML simplification
Email bodies can contain nested MIME structures and HTML. The Gmail route recursively searches for text content and removes common HTML markup when required.
Trade-off:
The result is readable plain text, but it is not a fully faithful rendering of every Gmail HTML email, embedded image, attachment, or complex layout.
---
Known Limitations
The inbox fetch currently uses a fixed small page size and does not implement full pagination.
Assistant filtering primarily operates on the currently loaded email set.
Polling is near-real-time rather than event-driven push synchronization.
Local `qwen2.5:3b` can occasionally misunderstand ambiguous or unusual commands.
Email rendering is optimized for readable content rather than complete Gmail-style HTML fidelity.
The project is primarily structured for local development/demo use; production deployment requires additional hardening, environment configuration, monitoring, and OAuth deployment configuration.
---
Testing Checklist
Use this checklist before presenting or recording the application.
Authentication
[ ] Google sign-in works
[ ] Google logout works
[ ] Gmail permissions are granted
[ ] Re-login works after a revoked session
Gmail operations
[ ] Inbox loads real messages
[ ] Opening an unread message marks it read
[ ] Star/unstar updates Gmail
[ ] Delete moves a message to Trash
[ ] Starred folder loads correctly
[ ] Trash folder loads correctly
[ ] Manual Refresh works
Compose and reply
[ ] Compose opens with empty fields
[ ] Required-field validation works
[ ] Send confirmation appears
[ ] Cancel in confirmation prevents sending
[ ] Successful send reaches Gmail
[ ] Reply uses the correct sender
[ ] Reply uses `Re:` subject handling
AI
[ ] Ollama is running
[ ] `qwen2.5:3b` is available
[ ] AI Summary works
[ ] Key Points & Action Items work
[ ] Ask AI works
[ ] AI Reply works
[ ] All reply tones work
[ ] Priority & Category work
[ ] AI Search works
Central Assistant
[ ] Assistant panel opens/closes
[ ] `show unread emails` works
[ ] `show emails from the last 10 days` works
[ ] keyword/sender-style filters work
[ ] `send an email to ...` opens Compose with data filled
[ ] `reply to this ...` uses the current email context
[ ] filtered email previews appear
[ ] clicking a preview opens the corresponding email
Real-time sync
[ ] Open an email and leave it selected
[ ] Wait for at least one 20-second polling cycle
[ ] No unnecessary full-screen loading flash occurs
[ ] Manual Refresh still shows the normal loading state
Build
Run:
```bash
npm run build
```
The build should complete without TypeScript or import errors before pushing the repository.
---
Screenshots and Demo
Add project screenshots here before publishing the repository.
Recommended screenshots:
Inbox — Gmail-style inbox with real messages
Email detail — Summary, key points, priority/category, and AI reply controls
Central Assistant — Natural-language command and matching email previews
Compose — Assistant-generated To/Subject/Body fields
Send confirmation — confirmation before a message is sent
Example Markdown placeholders:
```md
### Inbox
![NebulaMail Inbox](docs/screenshots/inbox.png)

### AI Assistant
![NebulaMail Assistant](docs/screenshots/assistant.png)

### Email Intelligence
![NebulaMail AI Analysis](docs/screenshots/email-analysis.png)
```
For a final submission, also add a short demo video/GIF link if available.
```md
## Demo Video
[Watch the NebulaMail demo](<your-video-link>)
```
---
Future Improvements
Potential next steps include:
Gmail history-based synchronization or push/webhook-style updates
Full inbox pagination and server-side Gmail search
Attachment support
Rich HTML email rendering
Draft saving
Labels and custom folders
Better intent classification using structured tool calling
Confidence scores for AI actions
Human-readable AI audit history
Streaming assistant responses
More capable local models for complex commands
Production deployment with HTTPS and deployed OAuth redirect URIs
Automated tests for API routes and assistant action mapping
Observability, rate limiting, and error monitoring
---
Troubleshooting
`Failed to fetch emails`
Check:
You are signed in.
Google OAuth access has not been revoked.
Gmail API is enabled.
The access token is valid or token refresh succeeds.
The Next.js development server is running.
If you recently revoked NebulaMail access in Google Account settings, sign in again and grant the Gmail permissions again.
AI request fails
Check that Ollama is running and the model exists:
```bash
ollama list
```
Then test:
```bash
ollama run qwen2.5:3b
```
The application expects the local Ollama endpoint:
```text
http://localhost:11434
```
OAuth redirect error
Verify that the Google Cloud OAuth client contains exactly:
```text
http://localhost:3000/api/auth/callback/google
```
and that the JavaScript origin contains:
```text
http://localhost:3000
```
Token refresh issues
If refresh continues to fail after changing OAuth configuration, remove the application's third-party access from the Google account and complete a fresh Google sign-in/consent flow.
---
License
This project does not currently declare a separate open-source license.
If you intend to publish it as an open-source project, add a license file such as `MIT`, `Apache-2.0`, or another license that matches your intended usage.
---
Project Summary
NebulaMail demonstrates how a modern web application can connect:
```text
Next.js
   +
Google OAuth
   +
Gmail API
   +
Ollama local AI
   +
React UI state
   =
AI-powered email client
```
The key design goal is not just generating AI text, but making AI output actionable inside the product: filtering the inbox, opening Compose, preparing contextual replies, summarizing messages, extracting actions, classifying priority, and helping users navigate real Gmail data.