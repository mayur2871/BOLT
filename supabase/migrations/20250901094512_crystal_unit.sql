/*
  # Create payment allocations table and update transport records

  1. New Tables
    - `payment_allocations`
      - `id` (uuid, primary key)
      - `lump_sum_payment_id` (uuid, foreign key) - References lump_sum_payments.id
      - `transport_record_id` (uuid, foreign key) - References transport_records.id
      - `allocated_amount` (numeric) - Amount allocated from lump sum to this record
      - `allocation_date` (date) - Date when allocation was made
      - `created_at` (timestamp) - Record creation time

  2. Table Modifications
    - Add `lump_sum_allocated_amount` column to `transport_records` table

  3. Security
    - Enable RLS on `payment_allocations` table
    - Add policy for public access
*/

CREATE TABLE IF NOT EXISTS payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lump_sum_payment_id uuid NOT NULL REFERENCES lump_sum_payments(id) ON DELETE CASCADE,
  transport_record_id uuid NOT NULL REFERENCES transport_records(id) ON DELETE CASCADE,
  allocated_amount numeric NOT NULL DEFAULT 0,
  allocation_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Add new column to transport_records table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transport_records' AND column_name = 'lump_sum_allocated_amount'
  ) THEN
    ALTER TABLE transport_records ADD COLUMN lump_sum_allocated_amount numeric DEFAULT 0;
  END IF;
END $$;

ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for payment_allocations"
  ON payment_allocations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);