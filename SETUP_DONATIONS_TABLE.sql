-- This SQL needs to be run in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor

-- Create donations table to track blood donation records
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  donation_date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read donations" ON donations;
DROP POLICY IF EXISTS "Allow authenticated users to insert donations" ON donations;
DROP POLICY IF EXISTS "Allow authenticated users to update donations" ON donations;
DROP POLICY IF EXISTS "Allow authenticated users to delete donations" ON donations;

-- Add policies for donations
CREATE POLICY "Allow authenticated users to read donations" 
  ON donations FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert donations" 
  ON donations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update donations" 
  ON donations FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete donations" 
  ON donations FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Verify the table was created (optional - check results)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'donations'
ORDER BY ordinal_position;
