-- Check if user_wallets_v2 table exists and create it if missing
DO $$
BEGIN
    -- Check if user_wallets_v2 table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_wallets_v2' AND table_schema = 'public') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.user_wallets_v2 (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL,
            chama_id UUID,
            wallet_type TEXT NOT NULL DEFAULT 'personal',
            balance DECIMAL(15,2) DEFAULT 0.00,
            withdrawal_locked BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Create the unique constraint
        ALTER TABLE public.user_wallets_v2 
        ADD CONSTRAINT unique_user_chama_wallet 
        UNIQUE (user_id, chama_id, wallet_type);

        -- Enable RLS
        ALTER TABLE public.user_wallets_v2 ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        CREATE POLICY "Users can manage their own wallets" ON public.user_wallets_v2
        FOR ALL USING (auth.uid() = user_id);

        -- Create updated_at trigger
        CREATE TRIGGER update_user_wallets_v2_updated_at
        BEFORE UPDATE ON public.user_wallets_v2
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

        RAISE NOTICE 'Created user_wallets_v2 table with unique constraint';
    ELSE
        -- Check if constraint exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE constraint_name = 'unique_user_chama_wallet' 
                      AND table_name = 'user_wallets_v2' 
                      AND table_schema = 'public') THEN
            -- Add the constraint if it doesn't exist
            ALTER TABLE public.user_wallets_v2 
            ADD CONSTRAINT unique_user_chama_wallet 
            UNIQUE (user_id, chama_id, wallet_type);
            
            RAISE NOTICE 'Added unique_user_chama_wallet constraint to existing table';
        ELSE
            RAISE NOTICE 'user_wallets_v2 table and constraint already exist';
        END IF;
    END IF;
END $$;