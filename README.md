# 🤖 Canadian Spirit Social Manager AI

> An AI-powered social media automation system that manages your entire online presence across every major platform — on complete autopilot.

[![GitHub Sponsors](https://img.shields.io/github/sponsors/princeflexzy0?style=for-the-badge&logo=github&logoColor=white&color=EA4AAA)](https://github.com/sponsors/princeflexzy0)
[![Twitter Follow](https://img.shields.io/twitter/follow/Princeflexzy0?style=for-the-badge&logo=twitter&color=1DA1F2)](https://twitter.com/Princeflexzy0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 👾 Meet Daisy

Daisy is the AI personality at the heart of this system. She's not a generic bot — she has her own voice, humor, opinions and style. She tweets like a real human, reacts to trending topics, engages with other users, and manages your brand across every platform simultaneously.

> *"I'm Daisy — created by Princeflexzy, a Nigerian full-stack developer and AI automation engineer. I post, engage, and grow your brand while you sleep."*

---

## 🚀 What It Does

| Feature | Status |
|---|---|
| AI-generated original posts | ✅ Live |
| Twitter/X automation | ✅ Live |
| Instagram automation | ✅ Live |
| TikTok scheduling | ✅ Live |
| Facebook page management | ✅ Live |
| Telegram channel automation | ✅ Live |
| Reddit community engagement | ✅ Live |
| Pinterest pin scheduling | ✅ Live |
| Google My Business updates | ✅ Live |
| WhatsApp bot | 🔜 Coming soon |
| Analytics dashboard | 🔜 Coming soon |
| Viral content detection | 🔜 Coming soon |

---

## 🧠 How It Works

```
Trending Topics → AI Brain (Daisy) → Platform APIs → Your Audience
```

1. Bot searches for trending topics in real time
2. Daisy generates human-sounding content with her own personality
3. Posts automatically across all connected platforms
4. Engages with replies, quotes and reactions
5. Logs everything to Supabase for analytics

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| AI Content | OpenAI GPT-4o-mini + Google Gemini |
| Twitter/X | Twitter API v2 (OAuth 1.0a + 2.0) |
| Hosting | Render (backend) + Vercel (frontend) |
| Automation | n8n webhook support |
| Scheduling | node-cron |

---

## 📁 Project Structure

```
├── backend/
│   ├── bots/
│   │   ├── twitterBot.js        # Twitter/X automation
│   │   ├── instagramBot.js      # Instagram automation
│   │   ├── tiktokBot.js         # TikTok scheduling
│   │   ├── facebookBot.js       # Facebook management
│   │   ├── telegramBot.js       # Telegram broadcasts
│   │   ├── redditBot.js         # Reddit engagement
│   │   ├── pinterestBot.js      # Pinterest scheduling
│   │   └── gmbBot.js            # Google My Business
│   ├── controllers/
│   │   └── adminController.js   # Bot scheduling and control
│   ├── routes/
│   │   └── admin.js             # Internal admin API
│   ├── services/
│   │   └── pgClient.js          # Supabase client
│   └── utils/
│       ├── autoContent.js       # AI content generation + Daisy's personality
│       └── logger.js            # Logging utility
├── frontend/                    # Vercel-hosted dashboard
└── README.md
```

---

## ⚙️ Environment Variables

```env
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

# Database
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Server
INTERNAL_SECRET=
ADMIN_API_KEY=
NODE_ENV=production
PORT=5000
```

---

## 🔧 Trigger a Bot Manually

```bash
curl -X POST https://your-render-url.onrender.com/admin/bots/twitter/run \
  -H "X-Internal-Secret: your_internal_secret" \
  -H "X-CS-User-Id: your_user_id" \
  -H "X-CS-Workspace-Id: your_workspace_id" \
  -H "Content-Type: application/json"
```

---

## 💰 Sponsor This Project

This project runs on real API credits and hosting costs every month:

| Service | Monthly Cost |
|---|---|
| X/Twitter API | $5 |
| OpenAI Credits | $20 |
| Render Hosting | $7 |
| **Total** | **$32/month** |

Your sponsorship keeps Daisy alive and helps me keep building in public as a self-taught developer from Nigeria.

### 🎁 Sponsor Tiers

| Tier | Reward |
|---|---|
| $5/month | Sponsor badge + name in README |
| $25/month | Logo in README + weekly build updates |
| $50/month | Early access to new platform integrations |
| $100/month | Access to private repo + priority feature requests |
| $200 one-time | 1 hour pair programming session |
| $500 one-time | I'll build a custom social automation tool for you |

👉 **[Become a Sponsor](https://github.com/sponsors/princeflexzy0)**

---

## 👨🏾‍💻 Author

Built with 🔥 by **Atere Emmanuel (Princeflexzy)**

A self-taught full-stack developer and AI automation engineer from Nigeria, building tools that compete on a global stage.

- Twitter: [@Princeflexzy0](https://twitter.com/Princeflexzy0)
- GitHub: [@princeflexzy0](https://github.com/princeflexzy0)
- Sponsor: [github.com/sponsors/princeflexzy0](https://github.com/sponsors/princeflexzy0)

---

*If this project helped you or inspired you, consider leaving a ⭐ and sharing it!*
