/*
  # Create lump sum payments table

  1. New Tables
    - `lump_sum_payments`
      - `id` (uuid, primary key)
      - `company_name` (text) - Transport company name
      - `amount` (numeric) - Total lump sum amount received
      - `date_received` (date) - Date when payment was received
      - `notes` (text) - Additional notes about the payment
      - `remaining_balance` (numeric) - Amount not yet allocated to records
      - `created_at` (timestamp) - Record creation time

  2. Security
    - Enable RLS on `lump_sum_payments` table
    - Add policy for public access (suitable for single-user app)
*/

CREATE TABLE IF NOT EXISTS lump_sum_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  date_received date DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  remaining_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lump_sum_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for lump_sum_payments"
  ON lump_sum_payments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);