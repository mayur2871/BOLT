/*
  # Create transport records table

  1. New Tables
    - `transport_records`
      - `id` (uuid, primary key)
      - `sr_no` (text) - Serial number
      - `sms_date` (text) - SMS/Plant loading date
      - `lr_date` (text) - LR date
      - `bilty_no` (text) - Bilty number
      - `truck_no` (text) - Truck number
      - `transport` (text) - Transport company name
      - `destination` (text) - Destination location
      - `weight` (text) - Weight information
      - `rate` (text) - Rate information
      - `total` (text) - Total amount
      - `bilty_charge` (text) - Bilty charge
      - `freight_amount` (text) - Freight amount
      - `advance` (text) - Advance amount
      - `advance_date` (text) - Advance date
      - `commission` (text) - Commission amount
      - `bal_paid_amount` (text) - Balance paid amount
      - `bal_paid_date` (text) - Balance paid date
      - `net_amount` (text) - Net amount
      - `is_bal_paid` (text) - Payment status (YES/NO)
      - `date_of_reach` (text) - Date of reach
      - `date_of_unload` (text) - Date of unload
      - `day_in_hold` (text) - Days in hold
      - `holding_charge` (text) - Holding charge
      - `total_holding_amount` (text) - Total holding amount
      - `courier_date` (text) - Courier date
      - `created_at` (timestamp) - Record creation time
      - `updated_at` (timestamp) - Record update time

  2. Security
    - Enable RLS on `transport_records` table
    - Add policy for public access (suitable for single-user app)
*/

CREATE TABLE IF NOT EXISTS transport_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no text DEFAULT '',
  sms_date text DEFAULT '',
  lr_date text DEFAULT '',
  bilty_no text DEFAULT '',
  truck_no text DEFAULT '',
  transport text DEFAULT '',
  destination text DEFAULT '',
  weight text DEFAULT '',
  rate text DEFAULT '',
  total text DEFAULT '',
  bilty_charge text DEFAULT '',
  freight_amount text DEFAULT '',
  advance text DEFAULT '',
  advance_date text DEFAULT '',
  commission text DEFAULT '',
  bal_paid_amount text DEFAULT '',
  bal_paid_date text DEFAULT '',
  net_amount text DEFAULT '',
  is_bal_paid text DEFAULT 'NO',
  date_of_reach text DEFAULT '',
  date_of_unload text DEFAULT '',
  day_in_hold text DEFAULT '',
  holding_charge text DEFAULT '',
  total_holding_amount text DEFAULT '',
  courier_date text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transport_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for transport_records"
  ON transport_records
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);