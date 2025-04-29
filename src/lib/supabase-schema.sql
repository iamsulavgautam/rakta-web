
-- Create donors table
CREATE TABLE donors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  phone TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  municipality TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sms_logs table to track SMS messages sent
CREATE TABLE sms_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_donors_province ON donors(province);
CREATE INDEX idx_donors_district ON donors(district);
CREATE INDEX idx_donors_municipality ON donors(municipality);

-- Create RLS policies
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all donors
CREATE POLICY "Allow authenticated users to read donors" 
  ON donors FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert, update, and delete donors
CREATE POLICY "Allow authenticated users to insert donors" 
  ON donors FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update donors" 
  ON donors FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete donors" 
  ON donors FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to manage SMS logs
CREATE POLICY "Allow authenticated users to read SMS logs" 
  ON sms_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert SMS logs" 
  ON sms_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
