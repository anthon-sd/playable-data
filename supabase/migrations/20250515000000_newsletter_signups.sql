-- Create a table for storing newsletter signups
CREATE TABLE IF NOT EXISTS public.newsletter_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    signup_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    source TEXT, -- Where the signup came from (main newsletter, sidebar, etc.)
    page_url TEXT, -- The URL where the signup occurred
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS newsletter_signups_email_idx ON public.newsletter_signups (email);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do anything
CREATE POLICY "Service role can do all" ON public.newsletter_signups
    USING (true)
    WITH CHECK (true);

-- Only admins can query the table
CREATE POLICY "Only authenticated users can view newsletter signups" ON public.newsletter_signups
    FOR SELECT USING (auth.role() = 'authenticated');

-- Storage function for auto-updating the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_newsletter_signups_updated_at
    BEFORE UPDATE ON public.newsletter_signups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 