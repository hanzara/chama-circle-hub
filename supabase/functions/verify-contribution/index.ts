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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) throw new Error('Not authenticated');

    const { contributionId, chamaId, verified, notes } = await req.json();

    console.log('Verifying contribution:', { contributionId, chamaId, verified });

    // Verify user has permission (admin or treasurer)
    const { data: verifierMember } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!verifierMember || !['admin', 'treasurer', 'chairman'].includes(verifierMember.role)) {
      throw new Error('Only admins and treasurers can verify contributions');
    }

    // Get contribution details
    const { data: contribution } = await supabase
      .from('chama_contributions_new')
      .select('*, chama_members!inner(user_id)')
      .eq('id', contributionId)
      .single();

    if (!contribution) throw new Error('Contribution not found');

    // Update contribution status
    const { error: updateError } = await supabase
      .from('chama_contributions_new')
      .update({
        status: verified ? 'verified' : 'rejected',
        notes: notes || contribution.notes
      })
      .eq('id', contributionId);

    if (updateError) throw updateError;

    // Create audit log
    await supabase
      .from('chama_audit_logs')
      .insert({
        chama_id: chamaId,
        action: verified ? 'contribution_verified' : 'contribution_rejected',
        actor_id: user.id,
        target_id: contribution.member_id,
        old_value: contribution.status,
        new_value: verified ? 'verified' : 'rejected',
        details: { contribution_id: contributionId, amount: contribution.amount, notes }
      });

    // Notify the contributor
    await supabase
      .from('chama_notifications')
      .insert({
        chama_id: chamaId,
        user_id: contribution.chama_members.user_id,
        type: 'contribution',
        title: verified ? 'Contribution Verified' : 'Contribution Rejected',
        message: verified 
          ? `Your contribution of KES ${contribution.amount} has been verified`
          : `Your contribution of KES ${contribution.amount} was rejected. ${notes || ''}`,
        metadata: { contribution_id: contributionId }
      });

    // Log activity
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: verified ? 'contribution_verified' : 'contribution_rejected',
        description: `Contribution ${verified ? 'verified' : 'rejected'} by ${verifierMember.role}`,
        amount: contribution.amount
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Contribution ${verified ? 'verified' : 'rejected'} successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Verification failed' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
