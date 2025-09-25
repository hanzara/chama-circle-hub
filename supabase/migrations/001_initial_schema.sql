
-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'treasurer', 'secretary', 'member');
CREATE TYPE contribution_status AS ENUM ('pending', 'completed', 'overdue');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted');
CREATE TYPE meeting_type AS ENUM ('regular', 'emergency', 'annual');
CREATE TYPE vote_type AS ENUM ('simple_majority', 'two_thirds', 'unanimous');
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  id_number TEXT,
  address TEXT,
  occupation TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chamas table
CREATE TABLE chamas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contribution_amount DECIMAL(12,2) NOT NULL,
  contribution_frequency TEXT NOT NULL DEFAULT 'monthly',
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create chama_members table (many-to-many relationship)
CREATE TABLE chama_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(chama_id, user_id)
);

-- Create contributions table
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  contribution_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  status contribution_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loans table
CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  purpose TEXT NOT NULL,
  repayment_period_months INTEGER NOT NULL,
  monthly_payment DECIMAL(12,2) NOT NULL,
  status loan_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loan_repayments table
CREATE TABLE loan_repayments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL,
  current_value DECIMAL(12,2),
  description TEXT,
  documents_url TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  type meeting_type DEFAULT 'regular',
  agenda TEXT[],
  minutes_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  options TEXT[] NOT NULL,
  vote_type vote_type DEFAULT 'simple_majority',
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create vote_responses table
CREATE TABLE vote_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, voter_id)
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  receipt_url TEXT,
  status expense_status DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chama_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Chamas policies
CREATE POLICY "Members can view their chamas" ON chamas FOR SELECT USING (
  id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Users can create chamas" ON chamas FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update chamas" ON chamas FOR UPDATE USING (
  id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);

-- Chama members policies
CREATE POLICY "Members can view chama membership" ON chama_members FOR SELECT USING (
  chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admins can manage members" ON chama_members FOR ALL USING (
  chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
);

-- Contributions policies
CREATE POLICY "Members can view chama contributions" ON contributions FOR SELECT USING (
  chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND is_active = true)
);
CREATE POLICY "Members can insert own contributions" ON contributions FOR INSERT WITH CHECK (
  auth.uid() = member_id AND 
  chama_id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid() AND is_active = true)
);

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chamas_updated_at BEFORE UPDATE ON chamas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
