# Kusmani Finance 💰

Aplikasi pencatatan keuangan dengan Sharing Pocket dan AI Agent yang truly agentic.

## Features

- ✅ Pencatatan keuangan (income/expense/transfer)
- ✅ Sharing Pocket dengan permission granular (viewer/contributor/admin)
- ✅ AI Agent yang bisa execute actions via natural language
- ✅ Audit trail lengkap untuk compliance
- ✅ Realtime sync dengan Supabase
- 🚀 Currency: IDR only

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + RLS)
- **AI:** Claude API (with tool use / function calling)
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Claude API key

### Setup

1. **Clone & Install**
```bash
npm install
```

2. **Environment Variables**
```bash
cp .env.example .env.local
```
Fill in your Supabase and Claude API credentials.

3. **Development**
```bash
npm run dev
```

4. **Build**
```bash
npm run build
```

## Project Structure

See `CLAUDE.md` for detailed project structure and rules.

## Security

- Row Level Security (RLS) for all tables
- Immutable audit logs
- Permission validation at database level
- AI Agent tool execution logging

## Database

Setup Supabase project:
```bash
supabase start
supabase migration up
```

## Contributing

See `CLAUDE.md` for critical rules and guidelines.

## License

MIT
