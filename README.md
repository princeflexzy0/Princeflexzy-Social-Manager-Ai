# Princeflexzy Social Manager AI

An AI-powered social media management bot that autonomously posts, engages, and manages content across multiple platforms.

## What It Does

- **Auto-posts** original AI-generated content to Twitter/X and other platforms
- **Engages** with other users — likes, replies, and quote retweets
- **Queue-based posting** — pull from a post queue in Supabase or generate fresh content on the fly
- **Smart replies** powered by Gemini AI
- **Webhook-driven** — trigger bots via internal API endpoints
- **n8n ready** — workflow automation support via webhooks

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini (content generation, smart replies)
- **Social APIs:** Twitter/X API v2 with OAuth 1.0a
- **Automation:** n8n (workflow automation)
- **Hosting:** Render (backend) + Vercel (frontend)

## Project Structure

```
├── backend/
│   ├── bots/
│   │   └── twitterBot.js       # Twitter automation bot
│   ├── routes/
│   │   └── admin.js            # Internal admin API routes
│   ├── services/
│   │   └── pgClient.js         # Supabase client
│   └── utils/
│       ├── autoContent.js      # AI content generation
│       ├── logger.js           # Logging utility
│       └── zapierTweet.js      # Legacy webhook util
├── frontend/                   # Vercel-hosted UI
└── README.md
```

## Environment Variables

```env
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
INTERNAL_SECRET=
ADMIN_API_KEY=
NODE_ENV=production
PORT=5000
```

## Running the Bot

Trigger the Twitter bot via internal API:

```bash
curl -X POST https://your-render-url.onrender.com/admin/bots/twitter/run \
  -H "X-Internal-Secret: your_internal_secret" \
  -H "X-CS-User-Id: your_user_id" \
  -H "X-CS-Workspace-Id: your_workspace_id" \
  -H "Content-Type: application/json"
```

## Notes

- Twitter API v2 posting requires a paid Basic plan ($100/month). Free tier is read-only.
- Gemini 1.5 Flash is used for fast content generation; Gemini 1.5 Pro for premium quality.
- Bot actions are logged to the `engagements` table in Supabase.

## Author

Built by **Princeflexzy** — [@Princeflexzy0](https://twitter.com/Princeflexzy0)