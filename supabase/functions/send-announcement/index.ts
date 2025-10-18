
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const { chamaId, title, message, targetMembers, priority } = await req.json();

    console.log('Sending announcement:', { chamaId, targetMembers, priority });

    // Verify user has permission
    const { data: senderMember } = await supabase
      .from('chama_members')
      .select('role, id')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!senderMember || !['admin', 'chairman', 'secretary'].includes(senderMember.role)) {
      throw new Error('Only admins, chairmen, and secretaries can send announcements');
    }

    // Get target members based on audience selection
    let query = supabase
      .from('chama_members')
      .select('user_id, id, profiles(full_name, email, phone_number)')
      .eq('chama_id', chamaId)
      .eq('is_active', true);

    if (targetMembers !== 'all') {
      // Filter by role or specific member if needed
      if (['admin', 'treasurer', 'secretary', 'member'].includes(targetMembers)) {
        query = query.eq('role', targetMembers);
      }
    }

    const { data: members, error: membersError } = await query;

    if (membersError) {
      throw new Error('Failed to get members');
    }

    // Get chama details
    const { data: chama, error: chamaError } = await supabase
      .from('chamas')
      .select('name')
      .eq('id', chamaId)
      .single();

    if (chamaError) {
      throw new Error('Failed to get chama details');
    }

    // Log the announcement as an activity
    const { error: activityError } = await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'announcement',
        description: `Announcement: ${title}`
      });

    if (activityError) {
      console.error('Failed to log activity:', activityError);
    }

    // Create notifications for all target members
    const notifications = members?.map(member => ({
      chama_id: chamaId,
      user_id: member.user_id,
      type: 'announcement',
      title: title,
      message: message,
      metadata: {
        sender_role: senderMember.role,
        priority: priority || 'normal',
        targetAudience: targetMembers
      }
    })) || [];

    const { error: notifError } = await supabase
      .from('chama_notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Failed to create notifications:', notifError);
    }

    console.log('Announcement sent:', {
      chama: chama.name,
      title,
      recipients: members?.length || 0,
      priority
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Announcement sent successfully',
      recipients: members?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Announcement error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Announcement sending failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
