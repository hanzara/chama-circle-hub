import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Fetching central wallet overview for user:', user.id);

    const walletEntities = [];

    // 1. Get Chama Savings
    const { data: chamaMembers } = await supabaseClient
      .from('chama_members')
      .select(`
        savings_balance,
        chama_id,
        chamas!inner(name, id)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (chamaMembers) {
      for (const member of chamaMembers) {
        if (member.savings_balance > 0 && member.chamas) {
          const chama = Array.isArray(member.chamas) ? member.chamas[0] : member.chamas;
          walletEntities.push({
            entity: 'Chama Savings',
            name: chama.name,
            value: member.savings_balance,
            id: chama.id
          });
        }
      }
    }

    // 2. Get Personal Savings
    const { data: personalGoals } = await supabaseClient
      .from('personal_savings_goals')
      .select('id, goal_name, current_amount')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (personalGoals) {
      for (const goal of personalGoals) {
        if (goal.current_amount > 0) {
          walletEntities.push({
            entity: 'Personal Savings',
            name: goal.goal_name,
            value: goal.current_amount,
            id: goal.id
          });
        }
      }
    }

    // 3. Get Merry-go-round Balances
    const { data: mgrMembers } = await supabaseClient
      .from('chama_members')
      .select(`
        mgr_balance,
        chama_id,
        chamas!inner(name, id)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (mgrMembers) {
      for (const member of mgrMembers) {
        if (member.mgr_balance > 0 && member.chamas) {
          const chama = Array.isArray(member.chamas) ? member.chamas[0] : member.chamas;
          walletEntities.push({
            entity: 'Merry-go-round',
            name: chama.name,
            value: member.mgr_balance,
            id: chama.id
          });
        }
      }
    }

    // 4. Get Central Wallet Balance
    const { data: centralWallet } = await supabaseClient
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (centralWallet && centralWallet.balance > 0) {
      walletEntities.push({
        entity: 'Central Wallet',
        name: 'Main Balance',
        value: centralWallet.balance,
        id: 'central'
      });
    }

    // Calculate total net worth
    const totalNetWorth = walletEntities.reduce((sum, entity) => sum + entity.value, 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          entities: walletEntities,
          totalNetWorth
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in central-wallet-overview:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
