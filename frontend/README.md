# Princeflexzy Social Manager AI — Frontend

## Overview

A Next.js dashboard for the Princeflexzy Social Manager AI system, supporting multi-role access for Admin, Partner, and Visitor users.

> **Note:** This frontend is a UI scaffold. All bots and automation run entirely via the backend. The dashboard is not yet fully wired to live backend data.

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

---

## Pages

- `/admin` — Bot management, analytics, posts, users, rewards, notifications, logs, settings
- `/partner` — Partner dashboard, posts, rewards, engagement
- `/visitor` — Public rewards page
- `/login` — Authentication

---

## Project Structure

frontend/
├── app/
│ ├── admin/ # Admin pages
│ ├── partner/ # Partner pages
│ ├── visitor/ # Visitor pages
│ └── login/ # Auth
├── components/
│ └── ui/ # Reusable UI components
├── lib/ # API clients and utilities
├── public/ # Static assets
└── types/ # TypeScript definitions


---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:3000`

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_URL` | Frontend App URL | `http://localhost:3000` |

---

## Notes

- API calls go to the backend at `NEXT_PUBLIC_API_URL`
- Auth handled via JWT middleware
- Full backend wiring is in progress