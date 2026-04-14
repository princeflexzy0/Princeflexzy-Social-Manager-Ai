# Princeflexzy Social Manager AI — Backend

## 🚀 Overview

The backend is a modular Node.js automation system for social media management, powered by Supabase. It handles Twitter/X automation via Daisy, blog generation, engagement tracking, rewards, notifications, and analytics.

---

## 🧠 System Flow

Input (Prompt/Text/Image)
|
v
AI Content Generation (OpenAI + Gemini) — Daisy's personality applied
|
v
Post Scheduling → Post Queue → Twitter/X Bot → Published
|
v
Engagement Tracking (replies, quotes, reactions)
|
v
Reward Issuance → Notifications
|
v
Analytics Dashboard


---

## 🧠 Key Features

- **Twitter/X Bot** (`/bots/twitterBot.js`)
  - AI-generated original tweets via Daisy
  - Trending topic detection
  - Auto-reply, quote tweets, engagement
  - OAuth 1.0a + OAuth 2.0 support
- **Telegram Bot** (`/bots/telegramBot.js`)
  - Channel broadcast automation
- **Blog Generator** (`/blog`)
  - AI blog writing via OpenAI GPT-4
- **Reward & Engagement Tracker**
  - Tracks engagement via Supabase
  - Automatically issues rewards when thresholds are met
- **Traps & Reminder System** (`/traps`, `/cron`)
  - Detects suspicious logins, triggers notifications and follow-ups
- **Supabase Integration**
  - All data, auth, and RLS logic via Supabase
- **Cron Jobs**
  - Automated scheduling via `scheduleBots.js`, `blogCron.js`, `reminderScheduler.js`
- **Notification System**
  - Alerts via Telegram

---

## ⚙️ Setup

### Requirements

- Node.js v18+
- Supabase project (URL and service key)
- Twitter API v2 credentials
- OpenAI API key

### Installation

```bash
git clone https://github.com/princeflexzy0/Princeflexzy-Social-Manager-Ai.git
cd Princeflexzy-Social-Manager-Ai/backend
npm install
```

---

## 🔐 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=production
INTERNAL_SECRET=
ADMIN_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Twitter/X
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_OAUTH2_ACCESS_TOKEN=
TWITTER_OAUTH2_REFRESH_TOKEN=

# AI
OPENAI_API_KEY=
GEMINI_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=



```

---

## 🚀 Running

```bash
node server.js
```

Express launches on `http://localhost:PORT`. Bots, cron jobs, and traps initialise automatically.

---

## 📦 Directory Structure

backend/
├── bots/
│ ├── twitterBot.js # Daisy — Twitter/X automation
│ └── telegramBot.js # Telegram broadcasts
├── blog/ # AI blog generation and syndication
├── controllers/ # Route controllers
├── cron/ # Scheduled jobs
│ ├── scheduleBots.js
│ ├── blogCron.js
│ └── reminderScheduler.js
├── routes/ # API routes
├── services/ # External service integrations
│ ├── aiService.js
│ ├── pgClient.js
│ └── notificationService.js
├── traps/ # Login trap detection
├── utils/ # Utilities (logger, mailer, SMS, etc.)
├── logs/ # Log files
├── server.js # Entry point
└── package.json


---

## 🧩 Extending

- Add new bots in `/bots`
- Add new routes in `/routes`
- Add notification channels in `services/notificationService.js`
- Add new traps in `/traps`
ENDOFFILE

Now the frontend README:

bash
cat > frontend/README.md << 'ENDOFFILE'
# Princeflexzy Social Manager AI — Frontend

## Overview

A Next.js dashboard scaffold for the Princeflexzy Social Manager AI system.

> **Note:** This frontend is a UI scaffold only. All bots and automation run entirely via the backend. The dashboard is not yet wired to live backend data.

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

---

## Pages

- `/admin` — Bot management, analytics, posts, users, rewards, notifications
- `/partner` — Partner dashboard, posts, rewards
- `/visitor` — Public rewards page
- `/login` — Auth page

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`

---

## Notes

- The frontend makes API calls to the backend at the URL set in `lib/api.ts`
- Authentication is handled via JWT middleware
- This UI was scaffolded as a starting point — full backend wiring is in progress