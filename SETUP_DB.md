# 🚀 Setup Database - 2 Menit

## Cara Tercepat: Copy-Paste ke Supabase Console

### Step 1: Buka Supabase SQL Editor
```
https://gewcoznigldatewomtay.supabase.co/project/default/sql
```

### Step 2: Copy semua migration SQL
```bash
cat supabase/migrations/000_all_migrations.sql
```

### Step 3: Paste ke SQL Editor
1. Click "New Query"
2. Paste seluruh SQL dari output di atas
3. Click "Run" (atau Ctrl+Enter)
4. **Wait hingga selesai** ✅

---

## Alternative: Run Migration File Satu-Satu

Jika ada error, run per-file ini:

```bash
# 1. Initial Schema
supabase/migrations/001_initial_schema.sql

# 2. RLS Policies
supabase/migrations/002_rls_policies.sql

# 3. Audit Triggers
supabase/migrations/003_audit_triggers.sql

# 4. Default Categories
supabase/migrations/004_default_categories.sql
```

---

## ✅ Verifikasi Success

Setelah run migrations, check di Supabase console:

```sql
-- Run ini di SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Harus ada 8 tables:
- ai_conversations
- audit_logs
- budgets
- categories
- pocket_members
- pockets
- profiles
- transactions

---

## 🎉 Selesai!

Sekarang:
1. Refresh **http://localhost:5173**
2. Click "Sign Up"
3. Create account
4. Aplikasi siap pakai! 🚀

---

## ⚠️ Troubleshooting

### "relation already exists"
- Okay, berarti migration sudah pernah jalan
- Lanjut saja

### "permission denied"
- Check `.env.local` credentials correct
- Pastikan pakai `VITE_SUPABASE_ANON_KEY`

### "syntax error"
- Pastikan copy SELURUH file, bukan sebagian
- Check ada trailing whitespace
