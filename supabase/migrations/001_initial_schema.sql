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
