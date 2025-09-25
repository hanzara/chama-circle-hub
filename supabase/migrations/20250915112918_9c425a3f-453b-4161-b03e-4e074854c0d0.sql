-- Create enums for the Chama system
CREATE TYPE public.wallet_type AS ENUM ('personal', 'chama_view_only', 'mgr', 'chama_central', 'savings');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.chama_role AS ENUM ('treasurer', 'secretary', 'chairman', 'member');
CREATE TYPE public.payment_provider AS ENUM ('mpesa', 'airtel', 'bank');

-- Create chamas table
CREATE TABLE public.chamas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    contribution_amount INTEGER NOT NULL DEFAULT 0,
    contribution_frequency TEXT NOT NULL DEFAULT 'monthly',
    contribution_day INTEGER DEFAULT 1,
    meeting_day TEXT DEFAULT 'sunday',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    current_members INTEGER DEFAULT 1
);

-- Create chama_members table  
CREATE TABLE public.chama_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    role public.chama_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    total_contributions INTEGER DEFAULT 0,
    last_contribution_date TIMESTAMP WITH TIME ZONE,
    UNIQUE(chama_id, user_id)
);

-- Create wallets table
CREATE TABLE public.wallets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    chama_id UUID REFERENCES public.chamas(id) ON DELETE CASCADE,
    wallet_type public.wallet_type NOT NULL,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings_accounts table
CREATE TABLE public.savings_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount INTEGER DEFAULT 0,
    current_amount INTEGER DEFAULT 0,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comprehensive transactions table
CREATE TABLE public.chama_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES public.profiles(user_id),
    to_user_id UUID REFERENCES public.profiles(user_id),
    from_wallet_id UUID REFERENCES public.wallets(id),
    to_wallet_id UUID REFERENCES public.wallets(id),
    chama_id UUID REFERENCES public.chamas(id),
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    status public.transaction_status NOT NULL DEFAULT 'pending',
    description TEXT,
    reference_id TEXT,
    provider_transaction_id TEXT,
    payment_provider public.payment_provider,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create mobile_money_accounts table
CREATE TABLE public.mobile_money_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    account_name TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mpesa_transactions table (enhanced from existing)
CREATE TABLE public.mpesa_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    chama_id UUID REFERENCES public.chamas(id),
    phone_number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    purpose TEXT,
    checkout_request_id TEXT,
    merchant_request_id TEXT,
    mpesa_receipt_number TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    result_code INTEGER,
    result_desc TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    callback_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard_entries table
CREATE TABLE public.leaderboard_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chama_id UUID NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    net_worth INTEGER DEFAULT 0,
    total_contributions INTEGER DEFAULT 0,
    loans_outstanding INTEGER DEFAULT 0,
    dividends_earned INTEGER DEFAULT 0,
    rank_position INTEGER,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(chama_id, user_id)
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(user_id),
    chama_id UUID REFERENCES public.chamas(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_chama_members_chama_id ON public.chama_members(chama_id);
CREATE INDEX idx_chama_members_user_id ON public.chama_members(user_id);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_chama_id ON public.wallets(chama_id);
CREATE INDEX idx_chama_transactions_user_id ON public.chama_transactions(from_user_id);
CREATE INDEX idx_chama_transactions_chama_id ON public.chama_transactions(chama_id);
CREATE INDEX idx_chama_transactions_status ON public.chama_transactions(status);
CREATE INDEX idx_mpesa_transactions_user_id ON public.mpesa_transactions(user_id);
CREATE INDEX idx_mpesa_transactions_checkout_id ON public.mpesa_transactions(checkout_request_id);

-- Enable RLS on all tables
ALTER TABLE public.chamas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chama_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_money_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chamas
CREATE POLICY "Users can view chamas they are members of" ON public.chamas
    FOR SELECT USING (
        id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create chamas" ON public.chamas
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Treasurers can update chama details" ON public.chamas
    FOR UPDATE USING (
        id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid() AND role = 'treasurer')
    );

-- RLS Policies for chama_members
CREATE POLICY "Users can view members of their chamas" ON public.chama_members
    FOR SELECT USING (
        chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can join chamas" ON public.chama_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallets" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets" ON public.wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for savings_accounts
CREATE POLICY "Users can manage their own savings accounts" ON public.savings_accounts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for chama_transactions
CREATE POLICY "Users can view their transactions" ON public.chama_transactions
    FOR SELECT USING (
        auth.uid() = from_user_id OR 
        auth.uid() = to_user_id OR
        chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create transactions" ON public.chama_transactions
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for mobile_money_accounts
CREATE POLICY "Users can manage their own mobile money accounts" ON public.mobile_money_accounts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for mpesa_transactions
CREATE POLICY "Users can view their own M-Pesa transactions" ON public.mpesa_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own M-Pesa transactions" ON public.mpesa_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboard_entries
CREATE POLICY "Users can view leaderboard for their chamas" ON public.leaderboard_entries
    FOR SELECT USING (
        chama_id IN (SELECT chama_id FROM public.chama_members WHERE user_id = auth.uid())
    );

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chamas_updated_at
    BEFORE UPDATE ON public.chamas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at
    BEFORE UPDATE ON public.savings_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mpesa_transactions_updated_at
    BEFORE UPDATE ON public.mpesa_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create wallets when user joins chama
CREATE OR REPLACE FUNCTION public.create_chama_wallets()
RETURNS TRIGGER AS $$
BEGIN
    -- Create chama view-only wallet
    INSERT INTO public.wallets (user_id, chama_id, wallet_type, name, is_locked)
    VALUES (NEW.user_id, NEW.chama_id, 'chama_view_only', 'Chama Contributions', true);
    
    -- Create MGR wallet
    INSERT INTO public.wallets (user_id, chama_id, wallet_type, name)
    VALUES (NEW.user_id, NEW.chama_id, 'mgr', 'Merry-Go-Round', false);
    
    -- If this is the creator (treasurer), create chama central wallet
    IF NEW.role = 'treasurer' THEN
        INSERT INTO public.wallets (user_id, chama_id, wallet_type, name)
        VALUES (NEW.user_id, NEW.chama_id, 'chama_central', 'Chama Central Fund', false);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_chama_wallets_trigger
    AFTER INSERT ON public.chama_members
    FOR EACH ROW
    EXECUTE FUNCTION public.create_chama_wallets();

-- Create function to update chama member count
CREATE OR REPLACE FUNCTION public.update_chama_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.chamas 
        SET current_members = current_members + 1 
        WHERE id = NEW.chama_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.chamas 
        SET current_members = current_members - 1 
        WHERE id = OLD.chama_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;