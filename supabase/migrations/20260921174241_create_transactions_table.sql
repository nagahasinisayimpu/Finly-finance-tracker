/*
# Create transactions table (single-tenant, no auth)

1. New Tables
- `transactions`
  - `id` (uuid, primary key, auto-generated)
  - `amount` (numeric, not null) — the transaction amount
  - `type` (text, not null) — 'income' or 'expense'
  - `category` (text, not null) — category name (Food, Rent, Salary, etc.)
  - `description` (text, not null) — what the transaction was for
  - `date` (date, not null) — the date of the transaction
  - `created_at` (timestamptz, default now()) — when the record was created

2. Security
- Enable RLS on `transactions`.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in.
- All policies use `TO anon, authenticated` so the anon-key frontend can read and write.

3. Indexes
- Index on `date` for sorting by date (recent transactions, monthly filtering).
- Index on `type` for filtering by income/expense.
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);
