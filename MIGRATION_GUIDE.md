# Database Migration Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
```
1. Go to: https://gewcoznigldatewomtay.supabase.co
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
```

### Step 2: Run Migration 001 (Initial Schema)
```
1. Click "New Query"
2. Copy-paste ENTIRE content dari supabase/migrations/001_initial_schema.sql
3. Click "Run" (Ctrl+Enter)
4. Wait untuk completion ✅
```

### Step 3: Run Migration 002 (RLS Policies)
```
1. Click "New Query"
2. Copy-paste ENTIRE content dari supabase/migrations/002_rls_policies.sql
3. Click "Run"
4. Wait untuk completion ✅
```

### Step 4: Run Migration 003 (Audit Triggers)
```
1. Click "New Query"
2. Copy-paste ENTIRE content dari supabase/migrations/003_audit_triggers.sql
3. Click "Run"
4. Wait untuk completion ✅
```

### Step 5: Run Migration 004 (Default Categories)
```
1. Click "New Query"
2. Copy-paste ENTIRE content dari supabase/migrations/004_default_categories.sql
3. Click "Run"
4. Wait untuk completion ✅
```

## ✅ Verification

Setelah semua migrations selesai, verifikasi dengan query:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

Harus ada tables:
- profiles
- pockets
- pocket_members
- categories
- transactions
- budgets
- audit_logs
- ai_conversations

## 🐛 Troubleshooting

### Error: "relation already exists"
- Okay, berarti migration sudah pernah dijalankan
- Skip migration itu, lanjut ke yang berikutnya

### Error: "syntax error in SQL"
- Check apakah ada typo dalam copy-paste
- Pastikan copy-paste SELURUH file, jangan bagian saja

### Error: "permission denied"
- Pastikan menggunakan "anon" key, bukan "service_role" key
- Check .env.local sudah punya VITE_SUPABASE_ANON_KEY yang correct

## 🔗 Useful Resources
- Supabase SQL Editor: https://gewcoznigldatewomtay.supabase.co/project/default/sql
- Supabase Docs: https://supabase.com/docs/reference/cli/supabase-db-push
