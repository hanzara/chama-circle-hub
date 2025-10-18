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

    const { operation, amount, goalName, frequency, source, pin, goalId } = await req.json();
    console.log('Personal savings operation:', { operation, amount, source, user: user.id });

    // Verify PIN
    const pinValid = await verifyUserPin(supabaseClient, user.id, pin);
    if (!pinValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid PIN' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    switch (operation) {
      case 'add':
        result = await handleAddSavings(supabaseClient, user.id, amount, goalName, frequency, source);
        break;
      case 'withdraw':
        result = await handleWithdrawSavings(supabaseClient, user.id, amount, goalId);
        break;
      default:
        throw new Error('Invalid operation');
    }

    return new Response(
      JSON.stringify({ success: true, message: result.message, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in personal-savings-ops:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyUserPin(supabase: any, userId: string, pin: string) {
  try {
    const { data: pinData, error } = await supabase
      .from('user_pins_enhanced')
      .select('pin_hash, salt, failed_attempts, locked_until')
      .eq('user_id', userId)
      .single();

    if (error || !pinData) return false;

    // Check if account is locked
    if (pinData.locked_until && new Date(pinData.locked_until) > new Date()) {
      throw new Error('Account is temporarily locked due to failed attempts');
    }

    // Hash the provided PIN with the stored salt
    const encoder = new TextEncoder();
    const data = encoder.encode(pinData.salt + pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === pinData.pin_hash) {
      // Reset failed attempts on successful verification
      await supabase
        .from('user_pins_enhanced')
        .update({ failed_attempts: 0 })
        .eq('user_id', userId);
      return true;
    } else {
      // Increment failed attempts
      const newFailedAttempts = (pinData.failed_attempts || 0) + 1;
      const lockUntil = newFailedAttempts >= 5 
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString() 
        : null;

      await supabase
        .from('user_pins_enhanced')
        .update({ 
          failed_attempts: newFailedAttempts,
          locked_until: lockUntil 
        })
        .eq('user_id', userId);

      return false;
    }
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
}

async function handleAddSavings(
  supabase: any, 
  userId: string, 
  amount: number, 
  goalName: string, 
  frequency: string, 
  source: string
) {
  // Verify sufficient funds based on source
  if (source === 'central_wallet') {
    const { data: wallet } = await supabase
      .from('user_central_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance in central wallet');
    }

    // Deduct from central wallet
    await supabase
      .from('user_central_wallets')
      .update({ balance: wallet.balance - amount })
      .eq('user_id', userId);

  } else if (source === 'merry_go_round') {
    // Check member's merry-go-round balance across their chamas
    const { data: members } = await supabase
      .from('chama_members')
      .select('mgr_balance, id')
      .eq('user_id', userId);

    const totalMgrBalance = members?.reduce((sum: number, m: any) => sum + (m.mgr_balance || 0), 0) || 0;
    if (totalMgrBalance < amount) {
      throw new Error('Insufficient balance in merry-go-round');
    }

    // Deduct from the first member record with sufficient balance
    for (const member of members || []) {
      if (member.mgr_balance >= amount) {
        await supabase
          .from('chama_members')
          .update({ mgr_balance: member.mgr_balance - amount })
          .eq('id', member.id);
        break;
      }
    }
  }
  // For M-Pesa, assume payment is already processed

  // Find or create savings goal
  let goalId = null;
  if (goalName) {
    const { data: existingGoal } = await supabase
      .from('personal_savings_goals')
      .select('id, current_amount')
      .eq('user_id', userId)
      .eq('goal_name', goalName)
      .eq('status', 'active')
      .single();

    if (existingGoal) {
      goalId = existingGoal.id;
      // Update goal amount
      await supabase
        .from('personal_savings_goals')
        .update({ 
          current_amount: existingGoal.current_amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);
    } else {
      // Create new goal
      const { data: newGoal } = await supabase
        .from('personal_savings_goals')
        .insert({
          user_id: userId,
          goal_name: goalName,
          target_amount: amount * 10, // Default target is 10x first contribution
          current_amount: amount
        })
        .select()
        .single();
      goalId = newGoal?.id;
    }
  }

  // Create transaction record
  const { data: transaction } = await supabase
    .from('personal_savings_transactions')
    .insert({
      user_id: userId,
      savings_goal_id: goalId,
      amount: amount,
      transaction_type: 'deposit',
      frequency: frequency,
      payment_method: source,
      notes: `Saved via ${source}`
    })
    .select()
    .single();

  return {
    message: `Successfully saved KES ${amount}`,
    data: { transaction, goalId }
  };
}

async function handleWithdrawSavings(
  supabase: any, 
  userId: string, 
  amount: number, 
  goalId: string
) {
  // Get goal details
  const { data: goal, error: goalError } = await supabase
    .from('personal_savings_goals')
    .select('current_amount')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single();

  if (goalError || !goal) {
    throw new Error('Savings goal not found');
  }

  if (goal.current_amount < amount) {
    throw new Error('Insufficient savings balance');
  }

  // Update goal amount
  await supabase
    .from('personal_savings_goals')
    .update({ 
      current_amount: goal.current_amount - amount,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId);

  // Add to central wallet
  const { data: wallet } = await supabase
    .from('user_central_wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const newBalance = (wallet?.balance || 0) + amount;
  await supabase
    .from('user_central_wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  // Create transaction record
  await supabase
    .from('personal_savings_transactions')
    .insert({
      user_id: userId,
      savings_goal_id: goalId,
      amount: amount,
      transaction_type: 'withdrawal',
      frequency: 'one_time',
      payment_method: 'central_wallet',
      notes: 'Withdrawn to central wallet'
    });

  return {
    message: `Successfully withdrew KES ${amount} to central wallet`,
    data: { newBalance }
  };
}
