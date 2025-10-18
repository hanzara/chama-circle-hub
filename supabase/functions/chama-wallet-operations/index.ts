import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WalletOperation {
  operation: 'topup' | 'withdraw' | 'send' | 'unlock' | 'lock';
  chamaId: string;
  amount?: number;
  recipientMemberId?: string;
  payoutMethod?: 'mpesa' | 'airtel' | 'bank' | 'internal';
  payoutDetails?: {
    phoneNumber?: string;
    accountNumber?: string;
    bankName?: string;
  };
  targetMemberId?: string; // For unlock/lock operations
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized - please log in again');
    }

    const body: WalletOperation = await req.json();
    console.log('Wallet operation request:', body);

    // Get member record
    const { data: member, error: memberError } = await supabaseClient
      .from('chama_members')
      .select('id, user_id, role, savings_balance, mgr_balance, withdrawal_locked, chama_id')
      .eq('user_id', user.id)
      .eq('chama_id', body.chamaId)
      .eq('is_active', true)
      .single();

    if (memberError || !member) {
      throw new Error('Member not found in this chama');
    }

    let result;

    switch (body.operation) {
      case 'topup':
        result = await handleTopUp(supabaseClient, member, body.amount!);
        break;
      case 'withdraw':
        result = await handleWithdraw(supabaseClient, member, body.amount!, body.payoutMethod!, body.payoutDetails);
        break;
      case 'send':
        result = await handleSend(supabaseClient, member, body.amount!, body.recipientMemberId!, body.payoutMethod!, body.payoutDetails);
        break;
      case 'unlock':
        result = await handleUnlock(supabaseClient, member, body.targetMemberId!);
        break;
      case 'lock':
        result = await handleLock(supabaseClient, member, body.targetMemberId!);
        break;
      default:
        throw new Error('Invalid operation');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleTopUp(supabase: any, member: any, amount: number) {
  console.log('Processing top-up from savings to MGR:', amount);
  
  // Check savings balance
  if (member.savings_balance < amount) {
    throw new Error(`Insufficient savings balance. Available: KES ${member.savings_balance.toFixed(2)}`);
  }

  // Deduct from savings balance
  const { error: deductError } = await supabase
    .from('chama_members')
    .update({ 
      savings_balance: member.savings_balance - amount,
      mgr_balance: member.mgr_balance + amount
    })
    .eq('id', member.id);

  if (deductError) {
    console.error('Error updating balances:', deductError);
    throw new Error('Failed to transfer funds');
  }

  // Log audit trail
  await supabase.from('chama_audit_trail').insert({
    chama_id: member.chama_id,
    actor_id: member.id,
    action: 'topup_mgr_wallet',
    amount: amount,
    details: { 
      from: 'savings_balance', 
      to: 'mgr_balance',
      previous_savings: member.savings_balance,
      previous_mgr: member.mgr_balance,
      new_savings: member.savings_balance - amount,
      new_mgr: member.mgr_balance + amount
    }
  });

  // Create activity log
  await supabase.from('chama_activities').insert({
    chama_id: member.chama_id,
    member_id: member.id,
    activity_type: 'wallet_topup',
    description: `Transferred KES ${amount} from savings to MGR wallet`,
    amount: amount
  });

  return { 
    success: true, 
    message: `Successfully topped up KES ${amount} to MGR wallet`, 
    newMgrBalance: member.mgr_balance + amount,
    newSavingsBalance: member.savings_balance - amount
  };
}

async function handleWithdraw(supabase: any, member: any, amount: number, payoutMethod: string, payoutDetails: any) {
  console.log('Processing withdrawal:', amount, payoutMethod);

  // Check if withdrawal is locked
  if (member.withdrawal_locked) {
    throw new Error('Withdrawals are locked. Contact admin to unlock.');
  }

  if (member.mgr_balance < amount) {
    throw new Error(`Insufficient MGR balance. Available: ${member.mgr_balance}`);
  }

  // Deduct from MGR balance
  const { error: updateError } = await supabase
    .from('chama_members')
    .update({ 
      mgr_balance: member.mgr_balance - amount
    })
    .eq('id', member.id);

  if (updateError) throw updateError;

  // Process payout based on method
  let payoutStatus = 'pending';
  let payoutReference = `WD-${Date.now()}`;

  if (payoutMethod === 'internal') {
    // Add to central wallet
    await supabase.from('user_central_wallets').update({
      balance: supabase.raw(`balance + ${amount}`),
      updated_at: new Date().toISOString()
    }).eq('user_id', member.user_id);
    payoutStatus = 'completed';
  } else {
    // For external payouts (Mpesa/Airtel/Bank), create a pending transaction
    // In production, this would trigger actual payment processing
    console.log('External payout:', payoutMethod, payoutDetails);
  }

  // Log audit trail
  await supabase.from('chama_audit_trail').insert({
    chama_id: member.chama_id,
    actor_id: member.id,
    action: 'withdraw_mgr_wallet',
    amount: amount,
    details: { 
      method: payoutMethod, 
      status: payoutStatus,
      reference: payoutReference,
      ...payoutDetails 
    }
  });

  return { 
    success: true, 
    message: `Withdrawal of ${amount} initiated via ${payoutMethod}`,
    reference: payoutReference,
    status: payoutStatus
  };
}

async function handleSend(supabase: any, sender: any, amount: number, recipientMemberId: string, method: string, details: any) {
  console.log('Processing send:', amount, recipientMemberId);

  if (sender.mgr_balance < amount) {
    throw new Error(`Insufficient MGR balance. Available: ${sender.mgr_balance}`);
  }

  // Get recipient
  const { data: recipient, error: recipientError } = await supabase
    .from('chama_members')
    .select('id, user_id, mgr_balance')
    .eq('id', recipientMemberId)
    .eq('chama_id', sender.chama_id)
    .eq('is_active', true)
    .single();

  if (recipientError || !recipient) {
    throw new Error('Recipient not found');
  }

  // Deduct from sender
  await supabase.from('chama_members')
    .update({ mgr_balance: sender.mgr_balance - amount })
    .eq('id', sender.id);

  // Add to recipient
  await supabase.from('chama_members')
    .update({ mgr_balance: recipient.mgr_balance + amount })
    .eq('id', recipient.id);

  // Log audit trail
  await supabase.from('chama_audit_trail').insert({
    chama_id: sender.chama_id,
    actor_id: sender.id,
    action: 'send_funds',
    target_member_id: recipient.id,
    amount: amount,
    details: { method, ...details }
  });

  // Create notification for recipient
  await supabase.from('chama_notifications').insert({
    chama_id: sender.chama_id,
    user_id: recipient.user_id,
    type: 'funds_received',
    title: 'Funds Received',
    message: `You received ${amount} in your MGR wallet`,
    metadata: { amount, sender_id: sender.id }
  });

  return { success: true, message: `Successfully sent ${amount} to member` };
}

async function handleUnlock(supabase: any, admin: any, targetMemberId: string) {
  console.log('Unlocking withdrawal for:', targetMemberId);

  // Check if user is admin
  if (admin.role !== 'admin' && admin.role !== 'chairman') {
    throw new Error('Only admins can unlock withdrawals');
  }

  // Unlock target member
  const { error: unlockError } = await supabase
    .from('chama_members')
    .update({ withdrawal_locked: false })
    .eq('id', targetMemberId)
    .eq('chama_id', admin.chama_id);

  if (unlockError) throw unlockError;

  // Get target member details for notification
  const { data: targetMember } = await supabase
    .from('chama_members')
    .select('user_id')
    .eq('id', targetMemberId)
    .single();

  // Log audit trail
  await supabase.from('chama_audit_trail').insert({
    chama_id: admin.chama_id,
    actor_id: admin.id,
    action: 'unlock_withdrawal',
    target_member_id: targetMemberId,
    details: { unlocked_by: admin.user_id }
  });

  // Notify member
  if (targetMember) {
    await supabase.from('chama_notifications').insert({
      chama_id: admin.chama_id,
      user_id: targetMember.user_id,
      type: 'withdrawal_unlocked',
      title: 'Withdrawal Unlocked',
      message: 'Your MGR wallet has been unlocked for withdrawal',
      metadata: { unlocked_by: admin.id }
    });
  }

  return { success: true, message: 'Withdrawal unlocked successfully' };
}

async function handleLock(supabase: any, admin: any, targetMemberId: string) {
  console.log('Locking withdrawal for:', targetMemberId);

  // Check if user is admin
  if (admin.role !== 'admin' && admin.role !== 'chairman') {
    throw new Error('Only admins can lock withdrawals');
  }

  // Lock target member
  const { error: lockError } = await supabase
    .from('chama_members')
    .update({ withdrawal_locked: true })
    .eq('id', targetMemberId)
    .eq('chama_id', admin.chama_id);

  if (lockError) throw lockError;

  // Log audit trail
  await supabase.from('chama_audit_trail').insert({
    chama_id: admin.chama_id,
    actor_id: admin.id,
    action: 'lock_withdrawal',
    target_member_id: targetMemberId,
    details: { locked_by: admin.user_id }
  });

  return { success: true, message: 'Withdrawal locked successfully' };
}
