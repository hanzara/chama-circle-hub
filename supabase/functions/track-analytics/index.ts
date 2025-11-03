import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { event, userId, metadata, timestamp } = await req.json();
    
    if (userId !== user.id) {
      throw new Error('User ID mismatch');
    }

    console.log('Tracking analytics event:', event, 'for user:', userId);

    // Store the analytics event
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_name: event,
        event_data: metadata || {},
        created_at: timestamp || new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting analytics event:', insertError);
      // Don't fail the request for analytics errors, just log them
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Return success even on error to not break user experience
    return new Response(
      JSON.stringify({ success: true, error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});