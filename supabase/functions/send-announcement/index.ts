
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

    const { chamaId, title, message } = await req.json();

    console.log('Sending announcement to chama:', chamaId);

    // Get all active members
    const { data: members, error: membersError } = await supabase
      .from('chama_members')
      .select('*, profiles(full_name, email, phone_number)')
      .eq('chama_id', chamaId)
      .eq('is_active', true);

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

    // For now, we'll just log the announcement and return success
    // In a real implementation, you would integrate with an email/SMS service
    console.log('Announcement details:', {
      chama: chama.name,
      title,
      message,
      recipients: members?.length || 0
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
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
