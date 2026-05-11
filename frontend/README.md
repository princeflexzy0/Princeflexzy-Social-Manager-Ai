 v# Default Automation Frontend

A modern web application built with Next.js 15.2.4, TypeScript, and Tailwind CSS, providing a comprehensive dashboard for automation management across different user roles.

## Features

- 🔐 Multi-role authentication (Admin, Partner, Visitor)
- 📊 Analytics dashboard with interactive charts
- 👥 User management and role assignments
- 📝 Blog and post management
- 🤖 Bot management and automation
- 🎯 Engagement tracking
- 📈 Leaderboard system
- 📜 Activity logging
- 🔔 Notification system
- 🎁 Rewards management
- ⚙️ System settings
- 🪤 Trap management
- 🎨 Responsive UI with dark mode support

## Prerequisites

- Node.js 18.x or later
- pnpm 8.x or later
- Docker and Docker Compose (for containerized deployment)

## Quick Start

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd default-automation-fe
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to access the application.

## Development

### Project Structure

```
default-automation-fe/
├── app/                    # Next.js 15.2.4 app directory
│   ├── admin/             # Admin role pages
│   ├── partner/           # Partner role pages
│   ├── visitor/           # Visitor role pages
│   └── login/             # Authentication pages
├── components/            # Reusable React components
│   └── ui/               # UI component library
├── lib/                   # Utility functions and API clients
├── public/               # Static assets
├── styles/              # Global styles and Tailwind config
└── types/               # TypeScript type definitions
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Docker Deployment

### Development

```bash
docker compose -f docker-compose.dev.yml up
```

### Production

```bash
docker compose up -d
```

See [deployment documentation](./docs/deployment.md) for more details.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_URL` | Frontend App URL | `http://localhost:3000` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Screenshots

<img width="1284" height="646" alt="Screenshot from 2025-10-05 02-00-38" src="https://github.com/user-attachments/assets/9d676719-54ce-4228-933b-ad3fc9a7436e" />
<img width="1298" height="650" alt="Screenshot from 2025-10-05 02-00-52" src="https://github.com/user-attachments/assets/b1dd0fed-b6d3-4b34-b00f-ff831362c75e" />
<img width="1301" height="657" alt="Screenshot from 2025-10-05 02-01-01" src="https://github.com/user-attachments/assets/8abd174f-0caf-405d-bcb7-591539cfe2ac" />
<img width="1298" height="643" alt="Screenshot from 2025-10-05 02-01-06" src="https://github.com/user-attachments/assets/03c0091d-ad8c-4d83-b519-745a1d96fa21" />
<img width="1298" height="657" alt="Screenshot from 2025-10-05 02-01-10" src="https://github.com/user-attachments/assets/9130d32c-196c-4579-a65f-25e6d4f37338" />
<img width="1305" height="657" alt="Screenshot from 2025-10-05 02-01-14" src="https://github.com/user-attachments/assets/399d9836-84fa-49dc-b5eb-54b19566f99d" />
<img width="1291" height="635" alt="Screenshot from 2025-10-05 02-01-19" src="https://github.com/user-attachments/assets/354facae-ce5d-496c-b4e1-a90c0a0a69db" />
<img width="1298" height="635" alt="Screenshot from 2025-10-05 02-01-31" src="https://github.com/user-attachments/assets/1618cb3e-b17e-4178-a7cc-9221b79784ff" />
<img width="1284" height="621" alt="Screenshot from 2025-10-05 02-01-37" src="https://github.com/user-attachments/assets/9d3f56a4-5a7d-4652-b1dc-47773b531c28" />
<img width="1287" height="656" alt="Screenshot from 2025-10-05 02-01-56" src="https://github.com/user-attachments/assets/917b1212-9cdb-4ba4-b6a5-2227c2eaa235" />
<img width="1298" height="628" alt="Screenshot from 2025-10-05 02-02-00" src="https://github.com/user-attachments/assets/e84d9fa8-cd25-4d69-b309-ef658e5b3d25" />
# Deployment trigger Sat Apr 18 14:42:01 UTC 2026
# Railway deployment Sat Apr 18 15:14:51 UTC 2026
