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
