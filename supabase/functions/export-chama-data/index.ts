
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

    const { chamaId } = await req.json();

    console.log('Exporting data for chama:', chamaId);

    // Get all chama data
    const [chamaResult, membersResult, contributionsResult, loansResult, activitiesResult] = await Promise.all([
      supabase.from('chamas').select('*').eq('id', chamaId).single(),
      supabase.from('chama_members').select('*, profiles(full_name, email, phone_number)').eq('chama_id', chamaId),
      supabase.from('chama_contributions_new').select('*').eq('chama_id', chamaId),
      supabase.from('chama_loans').select('*').eq('chama_id', chamaId),
      supabase.from('chama_activities').select('*').eq('chama_id', chamaId).order('created_at', { ascending: false })
    ]);

    const exportData = {
      chama: chamaResult.data,
      members: membersResult.data || [],
      contributions: contributionsResult.data || [],
      loans: loansResult.data || [],
      activities: activitiesResult.data || [],
      exportedAt: new Date().toISOString(),
      summary: {
        totalMembers: membersResult.data?.length || 0,
        totalContributions: contributionsResult.data?.reduce((sum, c) => sum + c.amount, 0) || 0,
        totalLoans: loansResult.data?.reduce((sum, l) => sum + l.amount, 0) || 0,
        totalActivities: activitiesResult.data?.length || 0
      }
    };

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Export failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
