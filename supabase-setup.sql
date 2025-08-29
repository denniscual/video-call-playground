-- Create the meetings table in Supabase
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create an index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (for development)
-- In production, you'd want more restrictive policies
-- Note: DROP POLICY IF EXISTS first to avoid conflicts
DROP POLICY IF EXISTS "Allow all operations on meetings" ON meetings;
CREATE POLICY "Allow all operations on meetings" ON meetings
FOR ALL USING (true) WITH CHECK (true);