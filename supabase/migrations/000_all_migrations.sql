-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable MODDATETIME extension for updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Pockets table (wallets/accounts)
CREATE TABLE IF NOT EXISTS pockets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric(15, 2) DEFAULT 0,
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pocket Members (sharing with roles)
CREATE TABLE IF NOT EXISTS pocket_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pocket_id uuid NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('viewer', 'contributor', 'admin')),
  invited_by uuid REFERENCES profiles(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(pocket_id, user_id)
);

-- Categories (income/expense)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pocket_id uuid REFERENCES pockets(id) ON DELETE CASCADE, -- NULL = system default
  name text NOT NULL,
  icon text,
  color text,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pocket_id uuid NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  amount numeric(15, 2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pocket_id uuid NOT NULL REFERENCES pockets(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id), -- NULL = overall budget
  amount numeric(15, 2) NOT NULL CHECK (amount > 0),
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_by uuid NOT NULL REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Audit Logs (IMMUTABLE)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'AI_AGENT')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pocket_id uuid REFERENCES pockets(id) ON DELETE CASCADE,
  title text,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_pockets_owner_id ON pockets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pocket_members_user_id ON pocket_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pocket_members_pocket_id ON pocket_members(pocket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pocket_id ON transactions(pocket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_pocket_id ON categories(pocket_id);
CREATE INDEX IF NOT EXISTS idx_budgets_pocket_id ON budgets(pocket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pocket_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
-- RLS Policies for Kusmani Finance
-- All policies enforce permission checks at database level

-- ==== PROFILES ====
-- Users can only view their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ==== POCKETS ====
-- Users can SELECT pockets they own or are members of
DROP POLICY IF EXISTS "pockets_select" ON pockets;
DROP POLICY IF EXISTS "pockets_insert" ON pockets;
DROP POLICY IF EXISTS "pockets_update" ON pockets;
DROP POLICY IF EXISTS "pockets_delete" ON pockets;

CREATE POLICY "pockets_select" ON pockets
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
  );

-- Users can INSERT pockets (become owner)
CREATE POLICY "pockets_insert" ON pockets
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Only owners can UPDATE their pockets
CREATE POLICY "pockets_update" ON pockets
  FOR UPDATE USING (owner_id = auth.uid());

-- Only owners can DELETE their pockets
CREATE POLICY "pockets_delete" ON pockets
  FOR DELETE USING (owner_id = auth.uid());

-- ==== POCKET MEMBERS ====
-- Users can view members of pockets they have access to
DROP POLICY IF EXISTS "pocket_members_select" ON pocket_members;
DROP POLICY IF EXISTS "pocket_members_insert" ON pocket_members;
DROP POLICY IF EXISTS "pocket_members_update" ON pocket_members;
DROP POLICY IF EXISTS "pocket_members_delete" ON pocket_members;

CREATE POLICY "pocket_members_select" ON pocket_members
  FOR SELECT USING (
    pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
  );

-- Only pocket owners can INSERT members
CREATE POLICY "pocket_members_insert" ON pocket_members
  FOR INSERT WITH CHECK (
    pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- Only pocket owners can UPDATE members
CREATE POLICY "pocket_members_update" ON pocket_members
  FOR UPDATE USING (
    pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- Only pocket owners can DELETE members
CREATE POLICY "pocket_members_delete" ON pocket_members
  FOR DELETE USING (
    pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- ==== CATEGORIES ====
-- Users can view categories for pockets they have access to
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;

CREATE POLICY "categories_select" ON categories
  FOR SELECT USING (
    pocket_id IS NULL
    OR pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
  );

-- Users can INSERT categories for their pockets
CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (
    pocket_id IS NULL
    OR pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- Only category creators can UPDATE
CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (created_by = auth.uid());

-- Only category creators can DELETE
CREATE POLICY "categories_delete" ON categories
  FOR DELETE USING (created_by = auth.uid());

-- ==== TRANSACTIONS ====
-- Users can SELECT transactions from pockets they have access to
DROP POLICY IF EXISTS "transactions_select" ON transactions;
DROP POLICY IF EXISTS "transactions_insert" ON transactions;
DROP POLICY IF EXISTS "transactions_update" ON transactions;
DROP POLICY IF EXISTS "transactions_delete" ON transactions;

CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (
    pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
  );

-- Contributors and above can INSERT transactions
CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (
    pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members
      WHERE user_id = auth.uid() AND role IN ('contributor', 'admin')
    )
    AND created_by = auth.uid()
  );

-- Only transaction creators or pocket owners can UPDATE
CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (
    created_by = auth.uid()
    OR pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- Only transaction creators or pocket owners can DELETE
CREATE POLICY "transactions_delete" ON transactions
  FOR DELETE USING (
    created_by = auth.uid()
    OR pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- ==== BUDGETS ====
-- Users can SELECT budgets for pockets they have access to
DROP POLICY IF EXISTS "budgets_select" ON budgets;
DROP POLICY IF EXISTS "budgets_insert" ON budgets;
DROP POLICY IF EXISTS "budgets_update" ON budgets;
DROP POLICY IF EXISTS "budgets_delete" ON budgets;

CREATE POLICY "budgets_select" ON budgets
  FOR SELECT USING (
    pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
  );

-- Contributors and above can INSERT budgets
CREATE POLICY "budgets_insert" ON budgets
  FOR INSERT WITH CHECK (
    pocket_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members
      WHERE user_id = auth.uid() AND role IN ('contributor', 'admin')
    )
    AND created_by = auth.uid()
  );

-- Only budget creators or pocket owners can UPDATE
CREATE POLICY "budgets_update" ON budgets
  FOR UPDATE USING (
    created_by = auth.uid()
    OR pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- Only budget creators or pocket owners can DELETE
CREATE POLICY "budgets_delete" ON budgets
  FOR DELETE USING (
    created_by = auth.uid()
    OR pocket_id IN (SELECT id FROM pockets WHERE owner_id = auth.uid())
  );

-- ==== AUDIT LOGS ====
-- Users can only view audit logs for actions in pockets they have access to
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    record_id IN (
      SELECT id FROM pockets WHERE owner_id = auth.uid()
      UNION
      SELECT pocket_id FROM pocket_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- IMPORTANT: Audit logs are IMMUTABLE
-- No UPDATE or DELETE policies - prevent all modifications
-- INSERT is handled by triggers only

-- ==== AI CONVERSATIONS ====
-- Users can only access their own conversations
DROP POLICY IF EXISTS "ai_conversations_select" ON ai_conversations;
DROP POLICY IF EXISTS "ai_conversations_insert" ON ai_conversations;
DROP POLICY IF EXISTS "ai_conversations_update" ON ai_conversations;
DROP POLICY IF EXISTS "ai_conversations_delete" ON ai_conversations;

CREATE POLICY "ai_conversations_select" ON ai_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ai_conversations_insert" ON ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_conversations_update" ON ai_conversations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "ai_conversations_delete" ON ai_conversations
  FOR DELETE USING (user_id = auth.uid());
-- Audit Triggers for all tables
-- Automatically log INSERT, UPDATE, DELETE actions

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update balance when transaction is created/deleted
CREATE OR REPLACE FUNCTION update_pocket_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE pockets
    SET balance = CASE
      WHEN NEW.type = 'income' THEN balance + NEW.amount
      WHEN NEW.type = 'expense' THEN balance - NEW.amount
      ELSE balance
    END,
    updated_at = now()
    WHERE id = NEW.pocket_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE pockets
    SET balance = CASE
      WHEN OLD.type = 'income' THEN balance - OLD.amount
      WHEN OLD.type = 'expense' THEN balance + OLD.amount
      ELSE balance
    END,
    updated_at = now()
    WHERE id = OLD.pocket_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if amount or type changed
    IF OLD.amount != NEW.amount OR OLD.type != NEW.type THEN
      -- First, revert old transaction
      UPDATE pockets
      SET balance = CASE
        WHEN OLD.type = 'income' THEN balance - OLD.amount
        WHEN OLD.type = 'expense' THEN balance + OLD.amount
        ELSE balance
      END
      WHERE id = OLD.pocket_id;

      -- Then, apply new transaction
      UPDATE pockets
      SET balance = CASE
        WHEN NEW.type = 'income' THEN balance + NEW.amount
        WHEN NEW.type = 'expense' THEN balance - NEW.amount
        ELSE balance
      END,
      updated_at = now()
      WHERE id = NEW.pocket_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==== TRIGGERS FOR POCKETS ====
DROP TRIGGER IF EXISTS pocket_audit_trigger ON pockets;
DROP TRIGGER IF EXISTS pocket_updated_at_trigger ON pockets;

CREATE TRIGGER pocket_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON pockets
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER pocket_updated_at_trigger
BEFORE UPDATE ON pockets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==== TRIGGERS FOR POCKET MEMBERS ====
DROP TRIGGER IF EXISTS pocket_members_audit_trigger ON pocket_members;

CREATE TRIGGER pocket_members_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON pocket_members
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- ==== TRIGGERS FOR CATEGORIES ====
DROP TRIGGER IF EXISTS categories_audit_trigger ON categories;

CREATE TRIGGER categories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON categories
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- ==== TRIGGERS FOR TRANSACTIONS ====
DROP TRIGGER IF EXISTS transactions_audit_trigger ON transactions;
DROP TRIGGER IF EXISTS transactions_balance_trigger ON transactions;
DROP TRIGGER IF EXISTS transactions_updated_at_trigger ON transactions;

CREATE TRIGGER transactions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

CREATE TRIGGER transactions_balance_trigger
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_pocket_balance();

CREATE TRIGGER transactions_updated_at_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==== TRIGGERS FOR BUDGETS ====
DROP TRIGGER IF EXISTS budgets_audit_trigger ON budgets;

CREATE TRIGGER budgets_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON budgets
FOR EACH ROW EXECUTE FUNCTION log_audit_change();

-- ==== TRIGGERS FOR AI CONVERSATIONS ====
DROP TRIGGER IF EXISTS ai_conversations_updated_at_trigger ON ai_conversations;
DROP TRIGGER IF EXISTS ai_conversations_audit_trigger ON ai_conversations;

CREATE TRIGGER ai_conversations_updated_at_trigger
BEFORE UPDATE ON ai_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ai_conversations_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON ai_conversations
FOR EACH ROW EXECUTE FUNCTION log_audit_change();
-- Default categories for all users
-- pocket_id is NULL to make them available globally

INSERT INTO categories (pocket_id, name, icon, color, type, created_by) VALUES
-- Expenses
(NULL, 'Makan & Minuman', '🍔', '#F59E0B', 'expense', NULL),
(NULL, 'Transportasi', '🚗', '#3B82F6', 'expense', NULL),
(NULL, 'Shopping', '🛍️', '#EC4899', 'expense', NULL),
(NULL, 'Tagihan & Utilitas', '💡', '#8B5CF6', 'expense', NULL),
(NULL, 'Kesehatan', '🏥', '#EF4444', 'expense', NULL),
(NULL, 'Hiburan', '🎬', '#F97316', 'expense', NULL),
(NULL, 'Pendidikan', '📚', '#06B6D4', 'expense', NULL),
(NULL, 'Rumah & Properti', '🏠', '#84CC16', 'expense', NULL),
(NULL, 'Asuransi', '🛡️', '#6366F1', 'expense', NULL),
(NULL, 'Lainnya', '📌', '#64748B', 'expense', NULL),

-- Incomes
(NULL, 'Gaji', '💼', '#10B981', 'income', NULL),
(NULL, 'Bonus', '🎁', '#06B6D4', 'income', NULL),
(NULL, 'Freelance/Side Hustle', '💻', '#8B5CF6', 'income', NULL),
(NULL, 'Investasi', '📈', '#F59E0B', 'income', NULL),
(NULL, 'Hadiah', '🎉', '#EC4899', 'income', NULL),
(NULL, 'Lainnya', '➕', '#64748B', 'income', NULL);

-- Add note about default categories
-- These can be overridden by custom categories in each pocket
-- Fix RLS Policies for Signup Flow
-- The issue: profiles INSERT policy was too strict

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Create more permissive INSERT policy for signup
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    id = auth.uid() OR
    -- Allow during signup when user just created
    auth.role() = 'authenticated'
  );

-- Also ensure SELECT during signup
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR
    auth.role() = 'authenticated'
  );

-- Update policy: Allow UPDATE own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());
