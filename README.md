##1 Live Demo

https://nebula-mail-jade.vercel.app/

##2 Demo Video

[Watch the NebulaMail Assistant Demo](https://drive.google.com/file/d/1rGrisQXn0IY880SvG8mUCpyA9IuZdkZA/view?usp=sharing)

##3 Project Overview

NebulaMail is an AI-powered Gmail client built with Next.js that combines real Gmail integration with a natural-language AI assistant.

The assistant does more than answer questions. It can control the application UI, filter emails, open compose/reply/forward flows, populate email fields, summarize messages, answer questions about the selected email, and execute email-related actions.

##4 Problem Statement

Traditional email applications require users to manually search, navigate folders, understand long messages, identify important emails, and write repetitive replies.

NebulaMail addresses these problems by introducing an AI assistant that understands natural-language intent and connects that intent to real email application actions.

##5 Key Features

- Real Gmail integration using the Gmail API
- Google OAuth authentication
- Inbox, Sent, Starred, and Trash views
- Read / unread handling
- Star / unstar emails
- Delete emails
- Compose and send emails
- Reply and forward emails
- AI email summarization
- Key points and action-item extraction
- AI priority and category classification
- AI-generated replies with multiple tones
- Natural-language AI email search
- Context-aware questions about the current email
- Central AI Assistant
- Real-time background synchronization
- Send confirmation before sending
- Rich email previews inside the assistant

##6 Central AI Assistant

The Central AI Assistant is the core feature of NebulaMail.

It allows users to control the email application using natural language instead of manually navigating multiple UI controls.

Examples:

- "show unread emails"
- "show starred emails"
- "show emails from the last 7 days"
- "show LinkedIn emails"
- "compose an email"
- "send an email to example@gmail.com saying Hello"
- "reply to this email"
- "forward this email"
- "summarize this email"

The assistant converts user intent into structured application actions and updates the UI accordingly.

## Architecture

```text
                         User
                           |
                           v
                  +------------------+
                  |  NebulaMail UI   |
                  |     Next.js      |
                  +--------+---------+
                           |
             +-------------+-------------+
             |                           |
             v                           v
      +--------------+            +--------------+
      |   Gmail API  |            |   AI Layer   |
      |              |            |              |
      | Read         |            | Summary      |
      | Send         |            | Insights     |
      | Star         |            | Priority     |
      | Trash        |            | Reply        |
      | Read state   |            | Search       |
      +--------------+            | Ask AI       |
                                  | Assistant    |
                                  +------+-------+
                                         |
                                         v
                                  Hosted AI API


## 7. Application Flow

```md
## Application Flow

```text
Google Login
     |
     v
Authenticated Session
     |
     v
Gmail API
     |
     v
Inbox / Sent / Starred / Trash
     |
     v
Open Email
     |
     +--> AI Summary
     +--> Key Points & Actions
     +--> Priority & Category
     +--> AI Reply
     +--> Ask AI
     +--> Reply / Forward / Delete / Star

Natural-Language Command
          |
          v
    AI Assistant
          |
          v
   Structured Action
          |
          v
     UI State Update
          |
          v
 Application / Gmail Action



### 8. AI Architecture

```
## AI Architecture

```
User Command / Email
        |
        v
   Next.js API Route
        |
        v
   Prompt Construction
        |
        v
    Shared AI Layer
        |
        v
    Hosted AI API
        |
        v
   Model Response
        |
        v
   Response Parsing
        |
        v
      React UI




```
##9 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack application and API routes |
| React | UI and state management |
| TypeScript | Type safety |
| Tailwind CSS | UI styling |
| NextAuth / Auth.js | Authentication and session handling |
| Google OAuth 2.0 | Google authentication |
| Gmail API | Email operations |
| Groq API | Hosted AI inference |
| Vitest | Automated testing |
| Vercel | Production deployment |
| GitHub | Version control |

##10. Setup / Installation
Prerequisites
Node.js
npm
Git
Google account
Google Cloud project
Gmail API enabled
Hosted AI API account
Installation

git clone https://github.com/Ashmitha2802/nebula-mail.git

cd nebula-mail

npm install

Create a .env.local file in the project root:

AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...
GROQ_API_KEY=...

Run the development server:

npm run dev

Open:

http://localhost:3000

##11. Authentication / Gmail Integration

NebulaMail uses Google OAuth and the Gmail API.

Local Redirect URI

http://localhost:3000/api/auth/callback/google

Production Redirect URI

https://nebula-mail-jade.vercel.app/api/auth/callback/google

Gmail Scopes
gmail.readonly
gmail.send
gmail.modify

Access-token refresh is implemented so expired access tokens can be renewed using the refresh token.

##12. API Documentation
Gmail APIs

GET /api/gmail

Fetches emails from the selected folder.

Supported folders:

inbox
sent
starred
trash

POST /api/gmail/read

Marks an email as read.

POST /api/gmail/star

Stars or unstars an email.

DELETE /api/gmail/delete

Moves an email to Gmail Trash.

POST /api/gmail/send

Sends an email through Gmail.

AI APIs

POST /api/ai/summarize

Generates an AI summary of the selected email.

POST /api/ai/insights

Extracts key points and action items.

POST /api/ai/priority

Classifies email priority and category.

POST /api/ai/reply

Generates an AI reply.

POST /api/ai/search

Performs natural-language email search.

POST /api/ai/ask

Answers questions about the selected email.

POST /api/ai/assistant

Interprets natural-language commands and returns structured application actions.

##13. Project Structure

ai-mail-app/

├── app/

│ ├── api/

│ │ ├── ai/

│ │ │ ├── ask/

│ │ │ ├── assistant/

│ │ │ ├── insights/

│ │ │ ├── priority/

│ │ │ ├── reply/

│ │ │ ├── search/

│ │ │ └── summarize/

│ │ ├── auth/

│ │ │ └── [...nextauth]/

│ │ └── gmail/

│ │ ├── delete/

│ │ ├── read/

│ │ ├── send/

│ │ ├── star/

│ │ └── route.ts

│ ├── page.tsx

│ └── ...

├── lib/

│ └── ollama.ts

├── tests/

│ ├── assistant.test.ts

│ └── sanity.test.ts

├── vitest.config.ts

├── auth.ts

├── package.json

├── package-lock.json

├── next.config.ts

└── README.md

##14. Security
Google OAuth is used instead of collecting Gmail passwords.
OAuth credentials and AI API keys are stored as environment variables.
Secrets are not committed to GitHub.
Gmail operations are handled server-side.
AI endpoints are implemented as server-side API routes.
Email sending requires user confirmation.
AI prompts instruct the model not to invent email information.
AI search results are validated against the available email IDs.

##15. Engineering Decisions & Trade-offs
Central AI Assistant

A central assistant provides one natural-language interface for email actions instead of requiring users to navigate multiple controls.

Structured Actions

The assistant converts natural-language intent into structured actions such as:

SEND_EMAIL
REPLY_EMAIL
FORWARD_EMAIL
FILTER_EMAILS
SUMMARIZE_EMAIL
ASK_ABOUT_EMAIL
OPEN_COMPOSE

This keeps AI interpretation separate from application execution.

Hosted AI

A hosted AI API is used for production deployment instead of requiring a local model server.

Advantages:

Easier cloud deployment
No local GPU requirement
Simpler infrastructure

Trade-offs:

External service dependency
API usage may introduce cost
Network connectivity is required
Real-Time Synchronization

The application uses silent background polling every 20 seconds.

Advantages:

Simple implementation
Reliable
Easy to integrate

Trade-off:

Updates are not instantaneous like a push-based system.

##16. Testing

NebulaMail uses Vitest for automated testing.

Run:

npx vitest run

Current test result:

Test Files 2 passed

Tests 12 passed

The tests cover:

Compose commands
Send email commands
Reply commands
Forward commands
Unread filtering
Starred filtering
Recent-email filtering
Keyword email search
Summarization intent
Questions about the current email
Invalid assistant commands

The project also includes a basic sanity test to verify the test environment.

##17. Live Demo

Production application:

https://nebula-mail-jade.vercel.app/

The deployed application includes:

Google authentication
Gmail integration
AI email features
Central AI Assistant
Real-time synchronization
Send confirmation
Rich assistant email previews

##18. Demo Video

The demo focuses on the core requirement that the AI Assistant actively controls the application UI.

The demo demonstrates:

Google authentication
Inbox interaction
Natural-language unread filtering
Context-aware reply
Natural-language compose
Automatic form population
Send confirmation

Watch the demo:

https://drive.google.com/file/d/1rGrisQXn0IY880SvG8mUCpyA9IuZdkZA/view?usp=sharing

##19. Screenshots
Main Inbox

Shows the Gmail-style interface with Inbox, Sent, Starred, and Trash navigation.
<img width="1881" height="900" alt="image" src="https://github.com/user-attachments/assets/4b4511d8-c80f-4c80-88a6-9e498b1ce58e" />


Central AI Assistant

Shows the natural-language assistant panel used to control the application.

<img width="442" height="608" alt="image" src="https://github.com/user-attachments/assets/8140904a-6500-42f3-81a6-6d59981f91d5" />



Assistant Email Filtering

Shows natural-language filtering and rich email preview cards.

Context-Aware Reply

Shows the assistant opening a reply based on the currently selected email.

AI Summary

Shows the AI-generated summary of an email.
<img width="1525" height="662" alt="image" src="https://github.com/user-attachments/assets/969a803d-6afc-4657-a34d-3a57b2940cea" />


Priority & Category

Shows smart email classification.
<img width="1457" height="622" alt="image" src="https://github.com/user-attachments/assets/16371182-81a6-481a-9537-0be97bd8bd1f" />


Send Confirmation

Shows the confirmation dialog displayed before sending an email.

##20. Known Limitations
Email thread / conversation grouping is not implemented yet.
Real-time synchronization currently uses polling.
Some assistant filters operate on the currently loaded email set.
AI functionality depends on the hosted AI service.
Public Gmail OAuth usage may require additional Google verification depending on publishing status and requested scopes.

##21. What I Would Improve With More Time

With additional development time, I would improve NebulaMail in the following areas:

Add Gmail-style conversation and thread views.
Move more natural-language searches to server-side Gmail search.
Replace polling with Gmail push notifications.
Add multi-step assistant workflows.
Add stronger AI observability and latency monitoring.
Add end-to-end UI testing.
Improve keyboard navigation and accessibility.
Add attachment support and richer Gmail features.

##22. Future Enhancements
Conversation / thread view
Attachments
Gmail labels
Advanced Gmail search
Smart follow-up reminders
Multi-step AI workflows
Email scheduling
Push-based synchronization
Advanced accessibility

##23. Production Build

Run:

npm run build

The production build validates:

TypeScript compilation
Next.js compilation
Route generation
Production bundling

The project currently builds successfully.

##24. Deployment

NebulaMail is deployed on Vercel.

Production URL:

https://nebula-mail-jade.vercel.app/

Deployment flow:

Local Development
↓
Git Commit
↓
GitHub main branch
↓
Vercel
↓
Production Deployment

Environment variables required for production are configured through Vercel rather than committed to the repository.

##25. Repository

GitHub:

https://github.com/Ashmitha2802/nebula-mail

The repository contains:

Application source code
Gmail API routes
AI API routes
Authentication
Automated tests
Deployment configuration
Complete project documentation

##26. Conclusion

NebulaMail combines a real Gmail client with a natural-language AI assistant that understands user intent and translates that intent into real application actions.

The core concept is:

Traditional chatbot:

User → AI → Text Response

NebulaMail:

User
↓
Natural-Language Intent
↓
AI Assistant
↓
Structured Action
↓
NebulaMail UI
↓
Gmail / AI Operation

This allows the assistant to:

Understand email-related requests
Use the current email as context
Update the application interface
Filter emails
Open compose and reply flows
Populate email fields
Generate email intelligence
Execute actions while keeping the user in control

NebulaMail is designed as an AI-assisted email interface rather than simply a chatbot attached to an email application.

##27. Author

Ashmitha SV

NebulaMail — AI-powered Gmail client and natural-language email assistant.


