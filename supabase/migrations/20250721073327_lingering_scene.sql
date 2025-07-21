/*
  # Create saved options tables

  1. New Tables
    - `saved_trucks`
      - `id` (uuid, primary key)
      - `truck_no` (text, unique) - Truck number
      - `created_at` (timestamp) - Creation time
    
    - `saved_transports`
      - `id` (uuid, primary key)
      - `transport_name` (text, unique) - Transport company name
      - `created_at` (timestamp) - Creation time

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS saved_trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_no text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_transports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_transports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for saved_trucks"
  ON saved_trucks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for saved_transports"
  ON saved_transports
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);