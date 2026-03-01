-- Create the opportunities table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    problem TEXT,
    target_customer TEXT,
    market_size TEXT,
    competition_level TEXT,
    monetization_model TEXT,
    trend_signal TEXT,
    build_difficulty TEXT,
    opportunity_score NUMERIC(4, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- IMPORTANT: Adjust these policies based on your app's actual security needs!
-- By default, allowing all access for 'service_role' (the backend/API) 

-- Policy: Allow service role to do everything
CREATE POLICY "Allow service role full access to opportunities" ON public.opportunities
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to insert ideas
CREATE POLICY "Allow users to insert their own opportunities" ON public.opportunities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to view all ideas (or restrict via user_id if needed)
CREATE POLICY "Allow users to view opportunities" ON public.opportunities
    FOR SELECT
    TO authenticated
    USING (true);

-- Create updated_at trigger for convenience (optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
