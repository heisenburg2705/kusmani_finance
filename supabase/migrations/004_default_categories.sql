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
