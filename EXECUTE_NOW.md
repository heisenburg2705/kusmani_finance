# 🚀 SETUP DATABASE - DO THIS NOW!

## ⏱️ Takes 2 minutes

---

## Step 1️⃣: Copy SQL File

**Run this command in terminal:**

```bash
cat supabase/migrations/000_all_migrations.sql
```

**Output akan 474 lines of SQL. Copy semua! (Ctrl+A → Ctrl+C)**

---

## Step 2️⃣: Open Supabase Console

**Go to:**
```
https://gewcoznigldatewomtay.supabase.co/project/default/sql
```

---

## Step 3️⃣: Create & Execute Query

1. Click **"+ New Query"** button
2. Clear default query
3. Paste SQL yang sudah dicopy (Ctrl+V)
4. Click **"Run"** atau tekan **Ctrl+Enter**

**Wait for it to complete...** ⏳

---

## Step 4️⃣: Verify Success

Di Supabase console, run query ini:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Should see 8 tables:**
- ✅ ai_conversations
- ✅ audit_logs
- ✅ budgets
- ✅ categories
- ✅ pocket_members
- ✅ pockets
- ✅ profiles
- ✅ transactions

---

## Step 5️⃣: Test Application

**Refresh browser:**
```
http://localhost:5173
```

**Click "Sign Up":**
- Email: `test@example.com`
- Password: `password123`

**Welcome! 🎉**

---

## ✅ Success Indicators

- ✅ Can sign up
- ✅ Dashboard shows "Dompet Utama" pocket
- ✅ Can add transactions
- ✅ Can navigate to other pages

---

## 🆘 If Error

### Error: "relation already exists"
- **It's OK!** Migration already ran. Continue.

### Error: "syntax error"
- Make sure you copied **ALL** 474 lines (full file)
- Try again, line by line

### Error: "permission denied"
- Check credentials in `.env.local`
- Make sure `VITE_SUPABASE_ANON_KEY` is correct

---

## 🎯 Next Steps After Setup

1. **Explore Dashboard** - Add some test transactions
2. **Try AI Agent** (/ai-agent)
   - Type: "Catat pengeluaran makan 50rb"
   - Or: "Berapa saldo saya?"
3. **Create Pocket** (/pockets)
4. **Check Audit Logs** (/audit-logs)

---

**READY?** 👉 Go run `cat supabase/migrations/000_all_migrations.sql` now!
