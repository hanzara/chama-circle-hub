-- Create table to track all Paystack webhook events for debugging
CREATE TABLE IF NOT EXISTS paystack_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  reference TEXT NOT NULL,
  amount NUMERIC,
  channel TEXT,
  customer_email TEXT,
  webhook_data JSONB,
  status TEXT DEFAULT 'received',
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paystack_webhooks_reference ON paystack_webhooks(reference);
CREATE INDEX IF NOT EXISTS idx_paystack_webhooks_created_at ON paystack_webhooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_paystack_webhooks_status ON paystack_webhooks(status);

-- Enable RLS
ALTER TABLE paystack_webhooks ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy (using existing is_admin function)
CREATE POLICY "Only admins can view webhook logs"
  ON paystack_webhooks
  FOR SELECT
  USING (is_admin());