# Kusmani Finance - CLAUDE.md

## Project Overview
Aplikasi pencatatan keuangan dengan React + Supabase + Claude AI Agent yang truly agentic.
- Currency: IDR only
- Deploy: Vercel (frontend) + Supabase (backend)
- Focus: Security, audit trail, collaborative features

## Tech Stack
- Frontend: React 18 + Vite + TypeScript (strict mode)
- UI: Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + Realtime + RLS)
- AI: Claude API (claude-haiku-4-5-20251001 untuk chat, claude-sonnet-4-6 untuk complex reasoning)
- Data fetching: TanStack Query (React Query)
- Deploy: Vercel

## Critical Security Rules (NON-NEGOTIABLE)

### Database & RLS
1. **SEMUA tabel harus punya RLS policy** — tidak ada exception, tidak ada "akan tambah nanti"
2. Setiap tabel baru = perlu policy baru di migration
3. JANGAN pernah expose `service_role` key di frontend
4. Permission validation HARUS di RLS level, bukan hanya frontend logic
5. Audit log table (`audit_logs`) IMMUTABLE: tidak boleh di-UPDATE/DELETE oleh siapapun

### AI Agent
- Setiap tool execution HARUS di-log ke `audit_logs` dengan metadata lengkap
- Tools yang destructive (delete, update amount) HARUS minta user confirmation
- Agent HARUS check permission user sebelum execute action apapun
- System prompt harus include: user's pockets, recent transactions summary (untuk context)

### Frontend
- Semua monetary value display pakai `formatRupiah()` dari `lib/formatters.ts`
- Error handling WAJIB di semua async operation
- Loading state WAJIB untuk semua data fetching
- JANGAN store sensitive data (tokens, etc) di localStorage — biarkan Supabase handle

### Code Style
- TypeScript strict mode ON (`"strict": true` di tsconfig.json)
- Semua komponen dalam folder tersendiri
- Custom hooks untuk semua Supabase queries (di `hooks/`)
- Types/interfaces di `types/index.ts`
- Naming: camelCase untuk variables/functions, PascalCase untuk components

## Folder Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── BalanceCard.tsx
│   │   ├── RecentTransactions.tsx
│   │   └── SpendingChart.tsx
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── TransactionFilter.tsx
│   ├── pockets/
│   │   ├── PocketCard.tsx
│   │   ├── PocketForm.tsx
│   │   ├── MemberList.tsx
│   │   └── InviteModal.tsx
│   ├── ai-agent/
│   │   ├── AgentChat.tsx
│   │   ├── AgentMessage.tsx
│   │   └── ToolExecutionCard.tsx
│   └── ui/ (shadcn components)
├── hooks/
│   ├── useTransactions.ts
│   ├── usePockets.ts
│   ├── useAuth.ts
│   └── useAIAgent.ts
├── lib/
│   ├── supabase.ts (client initialization)
│   ├── claude.ts (AI agent + tool definitions)
│   └── formatters.ts (formatRupiah, formatDate, etc)
├── pages/
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Pockets.tsx
│   ├── PocketDetail.tsx
│   ├── AIAgent.tsx
│   └── Settings.tsx
├── types/
│   └── index.ts (semua type definitions)
└── App.tsx

supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_audit_triggers.sql
│   └── 004_default_categories.sql
└── functions/ (untuk edge functions nanti)
```

## Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_CLAUDE_API_KEY=<your-claude-api-key>  # Hanya untuk Vercel/backend, JANGAN di frontend runtime

# .env (untuk Supabase CLI)
SUPABASE_ACCESS_TOKEN=<token>
SUPABASE_PROJECT_ID=<project-id>
```

## Database Migration Rules

1. Setiap schema change = file migration baru di `supabase/migrations/`
2. Naming: `NNN_description.sql` (e.g., `001_initial_schema.sql`)
3. Migrations harus idempotent (bisa run berkali-kali tanpa error)
4. JANGAN drop column — gunakan `DEPRECATED` atau buat column baru
5. Semua tabel WAJIB punya:
   - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - `created_at timestamptz DEFAULT now()`
   - Tabel yang editable WAJIB punya: `updated_at timestamptz DEFAULT now()`

## AI Agent Implementation

### Tool Definition Format
```typescript
const tools = [
  {
    name: "get_transactions",
    description: "Fetch transactions from specific pocket",
    input_schema: {
      type: "object",
      properties: {
        pocket_id: { type: "string", description: "Pocket ID (UUID)" },
        filters: { type: "object", description: "Optional filters (category, date range, etc)" }
      },
      required: ["pocket_id"]
    }
  },
  // ... other tools
];
```

### Tool Execution Flow
1. User message → send to Claude API with tools
2. Claude returns tool_use block
3. Verify user has permission for that action (check RLS)
4. Execute tool (call Supabase or perform action)
5. Log to `audit_logs` dengan action='AI_AGENT'
6. Return result to Claude
7. Claude generates final response to user
8. Save conversation to `ai_conversations` table

### System Prompt Template
```
Kamu adalah financial advisor AI untuk aplikasi Kusmani Finance.
User memiliki pockets: [list user's pockets dengan nama dan saldo]

Recent transactions:
- [last 5 transactions]

Tools yang bisa kamu gunakan:
[list tools dengan penjelasan]

Penting:
- Selalu konfirmasi user sebelum execute action destructive (delete, update)
- Semua currency adalah IDR
- Format currency: Rp 1.500.000 (dengan titik untuk ribuan)
- Jangan assume pocket mana yang user maksud — tanya jika ada ambiguitas
```

## Verification Checklist

- [ ] Auth flow: register → login → logout berjalan
- [ ] CRUD transaksi: create/read/update/delete dengan RLS active
- [ ] Sharing pocket: invite user, verify viewer tidak bisa INSERT
- [ ] Audit log: setiap action muncul di `audit_logs`
- [ ] AI Agent: test natural language → tool call → action executed
- [ ] Permission check: verify agent tidak bisa execute action di luar user's permission
- [ ] Database audit triggers: create/update/delete automatically logged

## Helpful Commands

```bash
# Setup Supabase project locally
supabase start

# Run migrations
supabase migration up

# Reset database (development only!)
supabase db reset

# View logs
supabase logs --follow

# Deploy to production
supabase db push

# Frontend build
npm run build

# Frontend dev
npm run dev
```

## Notes for Future Me

- AI Agent tools harus defensive — selalu validate input dan permission
- Currency formatting adalah **CRITICAL** untuk financial app — jangan skip
- Audit logs adalah source of truth untuk compliance — treat it seriously
- RLS policies sering menjadi bottleneck — test performance dengan data besar
- Realtime sync di Supabase bisa expensive — monitor usage
