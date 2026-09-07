# NebulaMail

NebulaMail is an AI-powered Gmail client built with **Next.js**, **React**, **TypeScript**, **Google OAuth**, the **Gmail API**, and a local **Ollama LLM**.

The application combines everyday email operations with a natural-language AI assistant. Users can read, search, star, delete, compose, send, and reply to real Gmail messages while also using AI to summarize emails, extract key points and action items, generate replies, classify priority and category, and control inbox views through natural-language commands.

The main objective of NebulaMail is to demonstrate a practical full-stack AI application where AI output is connected to actual UI state and Gmail operations rather than functioning only as a standalone chatbot.

---

## Features

### Gmail and Authentication

- Google OAuth sign-in and sign-out
- Gmail API integration
- Real Gmail message data
- Inbox folder
- Starred folder
- Trash folder
- Read / unread email handling
- Star / unstar emails
- Delete emails by moving them to Gmail Trash
- Compose new emails
- Send emails through Gmail
- Reply to the currently opened email
- Automatic recipient extraction
- Automatic `Re:` subject handling
- Send confirmation before sending

### AI Email Intelligence

- AI-generated email summaries
- Key point extraction
- Action item extraction
- Ask AI questions about the currently opened email
- AI-generated replies
- Reply tone selection
  - Professional
  - Friendly
  - Short
- Smart priority classification
  - High
  - Medium
  - Low
- Smart category classification
  - Work
  - Internship
  - Education
  - Finance
  - Shopping
  - Promotion
  - Personal
  - Other
- Semantic email search

### Central AI Assistant

NebulaMail includes a centralized AI assistant panel that allows users to control the email application using natural language.

Example commands:

```text
Show unread emails
Show starred emails
Show emails from the last 10 days
Show LinkedIn emails
Show IDP mails
Compose a new email
Send an email to john@example.com saying hello
Reply to this email saying I'll join the meeting
Summarize this email
