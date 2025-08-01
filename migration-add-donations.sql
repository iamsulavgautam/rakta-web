-- Migration: Add donations table and relationships
-- Run this in Supabase SQL Editor

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

-- Add policies for donations
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read donations" 
  ON donations FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert donations" 
  ON donations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update donations" 
  ON donations FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete donations" 
  ON donations FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Insert some sample donation data (optional - for testing)
-- INSERT INTO donations (donor_id, donation_date, location, notes) 
-- SELECT 
--   id, 
--   CURRENT_DATE - (RANDOM() * 365)::INTEGER,
--   'Central Blood Bank',
--   'Regular donation'
-- FROM donors 
-- LIMIT 5;
