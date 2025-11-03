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

    const { chamaId, title, message, targetMembers, priority } = await req.json();

    console.log('Sending announcement:', { chamaId, title, targetMembers });

    // Verify sender has permission (admin, secretary, or chairman)
    const { data: senderMember } = await supabase
      .from('chama_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('chama_id', chamaId)
      .single();

    if (!senderMember || !['admin', 'secretary', 'chairman'].includes(senderMember.role)) {
      throw new Error('Only admins, secretaries, and chairmen can send announcements');
    }

    // Get target members (all or specific)
    let recipientUserIds: string[] = [];
    
    if (targetMembers === 'all' || !targetMembers) {
      const { data: members } = await supabase
        .from('chama_members')
        .select('user_id')
        .eq('chama_id', chamaId)
        .eq('is_active', true);
      
      recipientUserIds = members?.map(m => m.user_id) || [];
    } else {
      recipientUserIds = targetMembers;
    }

    // Create notifications for all recipients
    const notifications = recipientUserIds.map(userId => ({
      chama_id: chamaId,
      user_id: userId,
      type: 'announcement',
      title: title,
      message: message,
      metadata: { priority: priority || 'normal', sender_id: user.id }
    }));

    const { error: notifError } = await supabase
      .from('chama_notifications')
      .insert(notifications);

    if (notifError) throw notifError;

    // Log the announcement in activities
    await supabase
      .from('chama_activities')
      .insert({
        chama_id: chamaId,
        activity_type: 'announcement_sent',
        description: `Announcement sent: ${title}`,
        amount: null
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Announcement sent successfully',
      recipients: recipientUserIds.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Announcement error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to send announcement' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
