import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WalletOperation {
  action: string;
  user_id?: string;
  chama_id?: string;
  wallet_id?: string;
  amount?: number;
  recipient_id?: string;
  phone_number?: string;
  description?: string;
  pin?: string;
  wallet_type?: string;
  name?: string;
}

serve(async (req) => {
  console.log('=== Chama Wallet API Called ===');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const { action, ...params }: WalletOperation = await req.json();
    console.log('Action:', action);
    console.log('Params:', params);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    switch (action) {
      case 'create_chama':
        return await createChama(supabase, userId, params);
      
      case 'join_chama':
        return await joinChama(supabase, userId, params);
      
      case 'get_user_wallets':
        return await getUserWallets(supabase, userId);
      
      case 'create_savings_account':
        return await createSavingsAccount(supabase, userId, params);
      
      case 'contribute_to_chama':
        return await contributeToChama(supabase, userId, params);
      
      case 'send_to_member':
        return await sendToMember(supabase, userId, params);
      
      case 'withdraw_funds':
        return await withdrawFunds(supabase, userId, params);
      
      case 'get_transaction_history':
        return await getTransactionHistory(supabase, userId, params);
      
      case 'get_chama_details':
        return await getChamaDetails(supabase, userId, params);
      
      case 'get_leaderboard':
        return await getLeaderboard(supabase, userId, params);
      
      case 'update_leaderboard':
        return await updateLeaderboard(supabase, params);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('=== API Error ===', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Create a new chama
async function createChama(supabase: any, userId: string, params: any) {
  const { name, description, contribution_amount, contribution_frequency, meeting_day, max_members } = params;
  
  console.log('Creating chama:', { name, contribution_amount });
  
  // Create the chama
  const { data: chama, error: chamaError } = await supabase
    .from('chamas')
    .insert({
      name,
      description,
      contribution_amount,
      contribution_frequency: contribution_frequency || 'monthly',
      meeting_day: meeting_day || 'sunday',
      max_members: max_members || 50,
      created_by: userId
    })
    .select()
    .single();

  if (chamaError) throw chamaError;

  // Add creator as treasurer
  const { error: memberError } = await supabase
    .from('chama_members')
    .insert({
      chama_id: chama.id,
      user_id: userId,
      role: 'treasurer'
    });

  if (memberError) throw memberError;

  // Log audit entry
  await logAuditEntry(supabase, userId, chama.id, 'create_chama', 'chama', chama.id, null, chama);

  return new Response(JSON.stringify({
    success: true,
    data: chama
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Join an existing chama
async function joinChama(supabase: any, userId: string, params: any) {
  const { chama_id, role = 'member' } = params;
  
  console.log('Joining chama:', { chama_id, userId });
  
  // Check if chama exists and has space
  const { data: chama, error: chamaError } = await supabase
    .from('chamas')
    .select('*')
    .eq('id', chama_id)
    .single();

  if (chamaError) throw new Error('Chama not found');
  
  if (chama.current_members >= chama.max_members) {
    throw new Error('Chama is full');
  }

  // Add user as member
  const { data: member, error: memberError } = await supabase
    .from('chama_members')
    .insert({
      chama_id,
      user_id: userId,
      role
    })
    .select()
    .single();

  if (memberError) throw memberError;

  // Log audit entry
  await logAuditEntry(supabase, userId, chama_id, 'join_chama', 'chama_member', member.id, null, member);

  return new Response(JSON.stringify({
    success: true,
    data: member
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get user's wallets
async function getUserWallets(supabase: any, userId: string) {
  console.log('Getting wallets for user:', userId);
  
  const { data: wallets, error } = await supabase
    .from('wallets')
    .select(`
      *,
      chamas(name),
      savings_accounts(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    data: wallets
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Create savings account
async function createSavingsAccount(supabase: any, userId: string, params: any) {
  const { wallet_id, name, target_amount, target_date } = params;
  
  console.log('Creating savings account:', { wallet_id, name });
  
  const { data: account, error } = await supabase
    .from('savings_accounts')
    .insert({
      wallet_id,
      user_id: userId,
      name,
      target_amount,
      target_date
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    data: account
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Contribute to chama
async function contributeToChama(supabase: any, userId: string, params: any) {
  const { chama_id, amount, description } = params;
  
  console.log('Contributing to chama:', { chama_id, amount });
  
  // Get user's chama view-only wallet
  const { data: userWallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('chama_id', chama_id)
    .eq('wallet_type', 'chama_view_only')
    .single();

  if (walletError) throw new Error('User chama wallet not found');

  // Get chama central wallet
  const { data: centralWallet, error: centralError } = await supabase
    .from('wallets')
    .select('*')
    .eq('chama_id', chama_id)
    .eq('wallet_type', 'chama_central')
    .single();

  if (centralError) throw new Error('Chama central wallet not found');

  // Update balances and create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('chama_transactions')
    .insert({
      from_user_id: userId,
      from_wallet_id: userWallet.id,
      to_wallet_id: centralWallet.id,
      chama_id,
      amount,
      transaction_type: 'contribution',
      status: 'completed',
      description: description || 'Chama contribution'
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // Update wallet balances
  await supabase
    .from('wallets')
    .update({ balance: userWallet.balance + amount })
    .eq('id', userWallet.id);

  await supabase
    .from('wallets')
    .update({ balance: centralWallet.balance + amount })
    .eq('id', centralWallet.id);

  // Update member contribution total
  const { data: member } = await supabase
    .from('chama_members')
    .select('total_contributions')
    .eq('user_id', userId)
    .eq('chama_id', chama_id)
    .single();

  await supabase
    .from('chama_members')
    .update({ 
      total_contributions: (member?.total_contributions || 0) + amount,
      last_contribution_date: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('chama_id', chama_id);

  return new Response(JSON.stringify({
    success: true,
    data: transaction
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Send money to another member
async function sendToMember(supabase: any, userId: string, params: any) {
  const { recipient_phone, amount, description, pin } = params;
  
  console.log('Sending to member:', { recipient_phone, amount });
  
  // Find recipient by phone number
  const { data: recipientProfile, error: recipientError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('phone', recipient_phone)
    .single();

  if (recipientError) throw new Error('Recipient not found');

  // Get sender's personal wallet (assuming they have one)
  const { data: senderWallet, error: senderError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('wallet_type', 'personal')
    .single();

  if (senderError) throw new Error('Sender wallet not found');

  if (senderWallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Get recipient's personal wallet
  const { data: recipientWallet, error: recipientWalletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', recipientProfile.user_id)
    .eq('wallet_type', 'personal')
    .single();

  if (recipientWalletError) throw new Error('Recipient wallet not found');

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('chama_transactions')
    .insert({
      from_user_id: userId,
      to_user_id: recipientProfile.user_id,
      from_wallet_id: senderWallet.id,
      to_wallet_id: recipientWallet.id,
      amount,
      transaction_type: 'transfer',
      status: 'completed',
      description: description || 'Member transfer'
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // Update balances
  await supabase
    .from('wallets')
    .update({ balance: senderWallet.balance - amount })
    .eq('id', senderWallet.id);

  await supabase
    .from('wallets')
    .update({ balance: recipientWallet.balance + amount })
    .eq('id', recipientWallet.id);

  return new Response(JSON.stringify({
    success: true,
    data: transaction
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Withdraw funds
async function withdrawFunds(supabase: any, userId: string, params: any) {
  const { wallet_id, amount, payment_method, phone_number } = params;
  
  console.log('Withdrawing funds:', { wallet_id, amount });
  
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('id', wallet_id)
    .eq('user_id', userId)
    .single();

  if (walletError) throw new Error('Wallet not found');

  if (wallet.is_locked) {
    throw new Error('Wallet is locked for withdrawals');
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Create withdrawal transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('chama_transactions')
    .insert({
      from_user_id: userId,
      from_wallet_id: wallet_id,
      amount: -amount,
      transaction_type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal to ${payment_method}`,
      metadata: { payment_method, phone_number }
    })
    .select()
    .single();

  if (transactionError) throw transactionError;

  // Update wallet balance
  await supabase
    .from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('id', wallet_id);

  return new Response(JSON.stringify({
    success: true,
    data: transaction,
    message: 'Withdrawal request submitted for processing'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get transaction history
async function getTransactionHistory(supabase: any, userId: string, params: any) {
  const { chama_id, limit = 50 } = params;
  
  let query = supabase
    .from('chama_transactions')
    .select(`
      *,
      from_wallet:from_wallet_id(name, wallet_type),
      to_wallet:to_wallet_id(name, wallet_type),
      chamas(name)
    `)
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (chama_id) {
    query = query.eq('chama_id', chama_id);
  }

  const { data: transactions, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    data: transactions
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get chama details
async function getChamaDetails(supabase: any, userId: string, params: any) {
  const { chama_id } = params;
  
  const { data: chama, error: chamaError } = await supabase
    .from('chamas')
    .select(`
      *,
      chama_members(
        *,
        profiles(username, phone)
      )
    `)
    .eq('id', chama_id)
    .single();

  if (chamaError) throw chamaError;

  // Get chama central wallet balance (only for treasurer)
  const { data: member } = await supabase
    .from('chama_members')
    .select('role')
    .eq('chama_id', chama_id)
    .eq('user_id', userId)
    .single();

  let centralBalance = null;
  if (member?.role === 'treasurer') {
    const { data: centralWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('chama_id', chama_id)
      .eq('wallet_type', 'chama_central')
      .single();
    
    centralBalance = centralWallet?.balance || 0;
  }

  return new Response(JSON.stringify({
    success: true,
    data: { ...chama, central_balance: centralBalance }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Get leaderboard
async function getLeaderboard(supabase: any, userId: string, params: any) {
  const { chama_id } = params;
  
  const { data: leaderboard, error } = await supabase
    .from('leaderboard_entries')
    .select(`
      *,
      profiles(username)
    `)
    .eq('chama_id', chama_id)
    .order('rank_position', { ascending: true });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    data: leaderboard
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update leaderboard (batch operation)
async function updateLeaderboard(supabase: any, params: any) {
  const { chama_id } = params;
  
  // Get all members with their wallet balances and contributions
  const { data: members, error: membersError } = await supabase
    .from('chama_members')
    .select(`
      user_id,
      total_contributions,
      profiles(username),
      wallets!inner(balance, wallet_type)
    `)
    .eq('chama_id', chama_id);

  if (membersError) throw membersError;

  // Calculate net worth for each member
  const leaderboardData = members.map((member: any) => {
    const personalWallet = member.wallets.find((w: any) => w.wallet_type === 'personal')?.balance || 0;
    const chamaWallet = member.wallets.find((w: any) => w.wallet_type === 'chama_view_only')?.balance || 0;
    const mgrWallet = member.wallets.find((w: any) => w.wallet_type === 'mgr')?.balance || 0;
    
    const netWorth = personalWallet + chamaWallet + mgrWallet;
    
    return {
      chama_id,
      user_id: member.user_id,
      net_worth: netWorth,
      total_contributions: member.total_contributions
    };
  });

  // Sort by net worth and assign ranks
  leaderboardData.sort((a: any, b: any) => b.net_worth - a.net_worth);
  leaderboardData.forEach((entry: any, index: number) => {
    entry.rank_position = index + 1;
    entry.calculated_at = new Date().toISOString();
  });

  // Upsert leaderboard entries
  const { error: upsertError } = await supabase
    .from('leaderboard_entries')
    .upsert(leaderboardData, { onConflict: 'chama_id,user_id' });

  if (upsertError) throw upsertError;

  return new Response(JSON.stringify({
    success: true,
    data: leaderboardData
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Audit logging helper
async function logAuditEntry(
  supabase: any,
  userId: string,
  chamaId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues: any,
  newValues: any
) {
  await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      chama_id: chamaId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues
    });
}