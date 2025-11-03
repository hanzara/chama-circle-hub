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

    const { chamaId, action, schedule } = await req.json();
    console.log('Managing MGR schedule:', { chamaId, action, user: user.id });

    // Verify user is admin
    const { data: adminMember, error: adminError } = await supabaseClient
      .from('chama_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .eq('is_active', true)
      .single();

    if (adminError || !adminMember || adminMember.role !== 'admin') {
      throw new Error('Only admins can manage MGR schedule');
    }

    let result;

    switch (action) {
      case 'set_schedule':
        result = await setSchedule(supabaseClient, chamaId, schedule);
        break;
      
      case 'set_next_turn':
        result = await setNextTurn(supabaseClient, chamaId);
        break;
      
      case 'lock_all':
        result = await lockAllWithdrawals(supabaseClient, chamaId);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true, message: result.message, data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error managing MGR schedule:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function setSchedule(supabase: any, chamaId: string, schedule: any[]) {
  // schedule should be an array of { member_id, turn_order, turn_date }
  
  for (const item of schedule) {
    await supabase
      .from('chama_members')
      .update({
        mgr_turn_order: item.turn_order,
        mgr_turn_date: item.turn_date,
        withdrawal_locked: true // Lock by default
      })
      .eq('id', item.member_id);
  }

  // Log activity
  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      activity_type: 'mgr_schedule_set',
      description: 'Merry-go-round schedule has been configured'
    });

  return {
    message: 'MGR schedule set successfully',
    data: schedule
  };
}

async function setNextTurn(supabase: any, chamaId: string) {
  // Get all members ordered by turn
  const { data: members, error } = await supabase
    .from('chama_members')
    .select('*')
    .eq('chama_id', chamaId)
    .eq('is_active', true)
    .order('mgr_turn_order', { ascending: true });

  if (error) throw error;

  if (!members || members.length === 0) {
    throw new Error('No members found');
  }

  // Find current turn (first one that's unlocked)
  const currentTurn = members.find((m: any) => !m.withdrawal_locked);
  
  // Find next member in order
  let nextMember;
  if (currentTurn) {
    const currentIndex = members.findIndex((m: any) => m.id === currentTurn.id);
    nextMember = members[(currentIndex + 1) % members.length];
  } else {
    nextMember = members[0]; // Start from first if none unlocked
  }

  // Lock current member if exists
  if (currentTurn) {
    await supabase
      .from('chama_members')
      .update({ withdrawal_locked: true })
      .eq('id', currentTurn.id);
  }

  // Unlock next member
  await supabase
    .from('chama_members')
    .update({ 
      withdrawal_locked: false,
      mgr_turn_date: new Date().toISOString()
    })
    .eq('id', nextMember.id);

  // Log activity
  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      member_id: nextMember.id,
      activity_type: 'mgr_turn_started',
      description: 'Started their merry-go-round turn'
    });

  // Send notification
  await supabase
    .from('chama_notifications')
    .insert({
      user_id: nextMember.user_id,
      chama_id: chamaId,
      type: 'mgr_turn',
      title: '🎯 Your Turn!',
      message: "It's your turn for the merry-go-round payout",
      metadata: { turn_order: nextMember.mgr_turn_order }
    });

  return {
    message: 'Next turn activated successfully',
    data: { nextMember: nextMember.id }
  };
}

async function lockAllWithdrawals(supabase: any, chamaId: string) {
  const { error } = await supabase
    .from('chama_members')
    .update({ withdrawal_locked: true })
    .eq('chama_id', chamaId);

  if (error) throw error;

  await supabase
    .from('chama_activities')
    .insert({
      chama_id: chamaId,
      activity_type: 'withdrawals_locked',
      description: 'All withdrawals have been locked by admin'
    });

  return {
    message: 'All withdrawals locked successfully',
    data: null
  };
}
