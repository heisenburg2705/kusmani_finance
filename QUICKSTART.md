# 🚀 Kusmani Finance - Quick Start Guide

## Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Groq API key

## Step 1: Setup Environment Variables

Edit `.env.local`:

```bash
# Supabase Cloud credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Groq API key (for AI agent in development)
VITE_GROQ_API_KEY=gsk_your-key-here
```

### How to get Supabase credentials:
1. Go to https://supabase.com
2. Sign up / Login
3. Create new project
4. Go to **Settings → API**
5. Copy **Project URL** and **anon public** key

### How to get Groq API key:
1. Go to https://console.groq.com
2. Sign up / Login
3. Copy your API key

## Step 2: Run Database Migrations

### Option A: Using Supabase Cloud Console (Manual)
1. Go to your Supabase project → SQL Editor
2. Create new query
3. Copy-paste SQL from `supabase/migrations/001_initial_schema.sql`
4. Run it
5. Repeat for files 002, 003, 004

### Option B: Using Supabase CLI (Automatic)
```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## Step 3: Start Development Server

```bash
npm run dev
```

Opens at: http://localhost:5173

## Step 4: Test Application

1. **Sign up** at login page
2. **Create pocket** automatically atau manual di /pockets
3. **Add transactions** via form di dashboard
4. **Try AI Agent** at /ai-agent
   - Example: "Catat pengeluaran makan 50rb"
   - Example: "Berapa saldo saya?"
5. **View audit logs** at /audit-logs

## Troubleshooting

### "Cannot connect to Supabase"
- Check .env.local values are correct
- Make sure Supabase project is initialized
- Check internet connection

### "AI Agent not responding"
- Verify GROQ_API_KEY is set correctly
- Check Groq API key is active
- Try switching to Claude (update factory.ts if needed)

### "Migrations not running"
- Check SQL syntax in migrations files
- Run migrations one by one
- Check for foreign key constraints issues

## Build for Production

```bash
npm run build
```

Output in `/dist` folder

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard (same as .env.local)

---

**Need help?** Check CLAUDE.md for detailed architecture and development guidelines.
