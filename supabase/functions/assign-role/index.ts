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

    const { chamaId, targetMemberId, newRole } = await req.json();
    console.log('Assigning role:', { chamaId, targetMemberId, newRole, admin: user.id });

    // Verify the requesting user is admin or creator
    const { data: adminMember, error: adminError } = await supabaseClient
      .from('chama_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .eq('is_active', true)
      .single();

    if (adminError || !adminMember || adminMember.role !== 'admin') {
      throw new Error('Only admins can assign roles');
    }

    // Verify target member exists
    const { data: targetMember, error: targetError } = await supabaseClient
      .from('chama_members')
      .select('*, profiles:user_id(full_name, email)')
      .eq('id', targetMemberId)
      .eq('chama_id', chamaId)
      .single();

    if (targetError || !targetMember) {
      throw new Error('Target member not found');
    }

    const oldRole = targetMember.role;

    // Update the member's role
    const { error: updateError } = await supabaseClient
      .from('chama_members')
      .update({ role: newRole })
      .eq('id', targetMemberId);

    if (updateError) throw updateError;

    // Log the role change in audit log
    await supabaseClient
      .from('chama_audit_logs')
      .insert({
        chama_id: chamaId,
        actor_id: user.id,
        target_id: targetMember.user_id,
        action: 'role_change',
        old_value: oldRole,
        new_value: newRole,
        details: {
          member_id: targetMemberId,
          member_email: (targetMember.profiles as any)?.email
        }
      });

    // Log activity
    await supabaseClient
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        member_id: targetMemberId,
        activity_type: 'role_assigned',
        description: `Role changed from ${oldRole} to ${newRole} by admin`
      });

    // Send notification to the member
    await supabaseClient
      .from('chama_notifications')
      .insert({
        user_id: targetMember.user_id,
        chama_id: chamaId,
        type: 'role_change',
        title: '🎖️ Role Updated',
        message: `Your role has been updated to ${newRole}`,
        metadata: { old_role: oldRole, new_role: newRole }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully assigned ${newRole} role`,
        data: { oldRole, newRole }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error assigning role:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
