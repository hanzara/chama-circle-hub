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

    const { operation, chamaId, amount, walletType, recipient, paymentMethod } = await req.json();
    console.log('Wallet operation:', { operation, chamaId, amount, walletType, recipient, user: user.id });

    // Get member record
    const { data: member, error: memberError } = await supabaseClient
      .from('chama_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      throw new Error('You are not a member of this chama');
    }

    let result;

    switch (operation) {
      case 'topup':
        result = await handleTopUp(supabaseClient, member, amount, chamaId);
        break;
      
      case 'withdraw':
        result = await handleWithdraw(supabaseClient, member, amount, chamaId, paymentMethod, recipient);
        break;
      
      case 'send':
        result = await handleSend(supabaseClient, member, amount, chamaId, recipient);
        break;
      
      case 'unlock':
        result = await handleUnlock(supabaseClient, user.id, chamaId, recipient);
        break;
      
      default:
        throw new Error('Invalid operation');
    }

    return new Response(
      JSON.stringify({ success: true, message: result.message, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in chama-wallet-ops:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleTopUp(supabase: any, member: any, amount: number, chamaId: string) {
  if (member.savings_balance < amount) {
    throw new Error('Insufficient savings balance');
  }

  const { error: updateError } = await supabase
    .from('chama_members')
    .update({
      savings_balance: member.savings_balance - amount,
      mgr_balance: member.mgr_balance + amount
    })
    .eq('id', member.id);

  if (updateError) throw updateError;

  await supabase
    .from('chama_wallet_transactions')
    .insert({
      chama_id: chamaId,
      transaction_type: 'transfer',
      amount: amount,
      description: `Top-up to MGR wallet from savings`,
      processed_by: member.id,
      status: 'completed'
    });

  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      member_id: member.id,
      activity_type: 'wallet_topup',
      description: `Topped up MGR wallet with KES ${amount}`,
      amount: amount
    });

  return {
    message: `Successfully topped up KES ${amount} to your MGR wallet`,
    data: { newSavingsBalance: member.savings_balance - amount, newMgrBalance: member.mgr_balance + amount }
  };
}

async function handleWithdraw(supabase: any, member: any, amount: number, chamaId: string, paymentMethod: string, recipient: string) {
  // Allow withdrawals regardless of lock status
  if (member.mgr_balance < amount) {
    throw new Error('Insufficient MGR wallet balance');
  }

  const { error: updateError } = await supabase
    .from('chama_members')
    .update({
      mgr_balance: member.mgr_balance - amount
    })
    .eq('id', member.id);

  if (updateError) throw updateError;

  await supabase
    .from('chama_wallet_transactions')
    .insert({
      chama_id: chamaId,
      transaction_type: 'withdrawal',
      amount: amount,
      description: `Withdrawal to ${paymentMethod} (${recipient})`,
      processed_by: member.id,
      payment_method: paymentMethod,
      payment_reference: recipient,
      status: 'completed'
    });

  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      member_id: member.id,
      activity_type: 'withdrawal',
      description: `Withdrew KES ${amount} to ${paymentMethod}`,
      amount: amount
    });

  return {
    message: `Withdrawal of KES ${amount} processed successfully`,
    data: { newMgrBalance: member.mgr_balance - amount }
  };
}

async function handleSend(supabase: any, member: any, amount: number, chamaId: string, recipientMemberId: string) {
  if (member.mgr_balance < amount) {
    throw new Error('Insufficient MGR wallet balance');
  }

  const { data: recipient, error: recipientError } = await supabase
    .from('chama_members')
    .select('*')
    .eq('id', recipientMemberId)
    .eq('chama_id', chamaId)
    .eq('is_active', true)
    .single();

  if (recipientError || !recipient) {
    throw new Error('Recipient not found');
  }

  const { error: senderError } = await supabase
    .from('chama_members')
    .update({
      mgr_balance: member.mgr_balance - amount
    })
    .eq('id', member.id);

  if (senderError) throw senderError;

  const { error: recipientUpdateError } = await supabase
    .from('chama_members')
    .update({
      mgr_balance: recipient.mgr_balance + amount
    })
    .eq('id', recipientMemberId);

  if (recipientUpdateError) throw recipientUpdateError;

  await supabase
    .from('chama_wallet_transactions')
    .insert({
      chama_id: chamaId,
      transaction_type: 'transfer',
      amount: amount,
      description: `Transfer to member`,
      processed_by: member.id,
      status: 'completed'
    });

  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      member_id: member.id,
      activity_type: 'member_transfer',
      description: `Sent KES ${amount} to another member`,
      amount: amount
    });

  return {
    message: `Successfully sent KES ${amount} to member`,
    data: { newMgrBalance: member.mgr_balance - amount }
  };
}

async function handleUnlock(supabase: any, userId: string, chamaId: string, targetMemberId: string) {
  const { data: adminMember, error: adminError } = await supabase
    .from('chama_members')
    .select('role')
    .eq('user_id', userId)
    .eq('chama_id', chamaId)
    .eq('is_active', true)
    .single();

  if (adminError || !adminMember || adminMember.role !== 'admin') {
    throw new Error('Only admins can unlock withdrawals');
  }

  const { error: unlockError } = await supabase
    .from('chama_members')
    .update({ withdrawal_locked: false })
    .eq('id', targetMemberId);

  if (unlockError) throw unlockError;

  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      member_id: targetMemberId,
      activity_type: 'withdrawal_unlocked',
      description: 'Withdrawals unlocked by admin'
    });

  return {
    message: 'Withdrawals unlocked successfully',
    data: null
  };
}
