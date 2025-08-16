-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Does not include production-level optimizations or advanced RLS policies

-- Enable Row Level Security

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cancellations table with enhanced fields
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  
  -- Cancellation journey tracking
  cancellation_step TEXT, -- Which step initiated the cancellation
  job_found BOOLEAN, -- Whether user found a job
  found_with_migrate_mate BOOLEAN, -- If job was found through Migrate Mate
  feedback_text TEXT, -- User feedback from feedback step
  reason TEXT, -- Cancellation reason selected by user
  visa_type TEXT, -- Visa type entered by user (if applicable)
  has_lawyer BOOLEAN, -- Whether user has a lawyer (if applicable)
  accepted_downsell BOOLEAN DEFAULT FALSE,
  final_outcome TEXT, -- Track final flow outcome (cancelled, continued, etc.)
  
  -- Survey data fields
  roles_applied TEXT, -- Number of roles applied for through Migrate Mate
  companies_emailed TEXT, -- Number of companies emailed directly
  companies_interviewed TEXT, -- Number of companies interviewed with
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS policies for security
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscription policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('active', 'pending_cancellation', 'cancelled')
  );

-- Cancellation policies with enhanced security
CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    downsell_variant IN ('A', 'B') AND
    (reason IS NULL OR length(reason) <= 500) AND
    (feedback_text IS NULL OR length(feedback_text) <= 2000) AND
    (visa_type IS NULL OR length(visa_type) <= 100) AND
    accepted_downsell IS NOT NULL
  );

CREATE POLICY "Users can view own cancellations" ON cancellations
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own cancellations with security constraints
CREATE POLICY "Users can update own cancellations" ON cancellations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (reason IS NULL OR length(reason) <= 500) AND
    (feedback_text IS NULL OR length(feedback_text) <= 2000) AND
    (visa_type IS NULL OR length(visa_type) <= 100) AND
    (roles_applied IS NULL OR length(roles_applied) <= 20) AND
    (companies_emailed IS NULL OR length(companies_emailed) <= 20) AND
    (companies_interviewed IS NULL OR length(companies_interviewed) <= 20) AND
    accepted_downsell IS NOT NULL AND
    (final_outcome IS NULL OR final_outcome IN ('cancelled', 'continued', 'downsell_accepted', 'pending-cancellation'))
  );

-- Prevent deletion of cancellations for audit trail
CREATE POLICY "No deletion of cancellations" ON cancellations
  FOR DELETE USING (false);

-- Additional security policies
CREATE POLICY "No deletion of users" ON users
  FOR DELETE USING (false);

CREATE POLICY "No deletion of subscriptions" ON subscriptions  
  FOR DELETE USING (false);

-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with $25 and $29 plans
INSERT INTO subscriptions (user_id, monthly_price, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
  ('550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
  ('550e8400-e29b-41d4-a716-446655440003', 2500, 'active')  -- $25.00
ON CONFLICT DO NOTHING;

-- Add performance indexes for cancellations table
CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_subscription_id ON cancellations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_variant ON cancellations(downsell_variant);
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON cancellations(created_at);
CREATE INDEX IF NOT EXISTS idx_cancellations_outcome ON cancellations(final_outcome);

-- Add index for subscription status queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status); 