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
