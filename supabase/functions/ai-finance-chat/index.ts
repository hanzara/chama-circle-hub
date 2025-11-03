import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not set');
      throw new Error('Lovable AI key is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { message, userId, contextData } = await req.json();

    if (!message || !userId) {
      throw new Error('Message and userId are required');
    }

    console.log(`Processing AI chat request for user: ${userId}`);
    console.log(`Message: ${message}`);

    // Get user's financial profile for context
    const { data: profile } = await supabase
      .from('user_financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get recent transactions for context
    const { data: transactions } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get financial goals for context
    const { data: goals } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Build context for AI
    const financialContext = {
      profile: profile || null,
      recentTransactions: transactions || [],
      activeGoals: goals || [],
      monthlyIncome: profile?.monthly_income || null,
      monthlyExpenses: profile?.monthly_expenses || null,
      currentSavings: profile?.current_savings || null,
      riskTolerance: profile?.risk_tolerance || 'medium'
    };

    const systemPrompt = `You are a helpful AI financial advisor for ChamaVault, a Kenyan fintech platform. 

User Context:
- Monthly Income: ${financialContext.monthlyIncome ? `KES ${financialContext.monthlyIncome}` : 'Not provided'}
- Monthly Expenses: ${financialContext.monthlyExpenses ? `KES ${financialContext.monthlyExpenses}` : 'Not provided'}
- Current Savings: ${financialContext.currentSavings ? `KES ${financialContext.currentSavings}` : 'Not provided'}
- Risk Tolerance: ${financialContext.riskTolerance}
- Active Goals: ${financialContext.activeGoals.length} goals
- Recent Transactions: ${financialContext.recentTransactions.length} transactions

Provide helpful, practical financial advice in simple language. Focus on:
- Kenyan financial context (KES currency, local investment options)
- Practical budgeting and savings tips
- Investment opportunities suitable for Kenya
- Chama (investment group) participation
- Mobile money (M-Pesa) optimization
- Building emergency funds
- Simple investment strategies

Keep responses concise, actionable, and encouraging. Use Kenyan context and examples.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI error:', response.status, errorData);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log(`AI Response: ${aiResponse}`);

    // Save chat history to database
    await supabase
      .from('ai_chat_history')
      .insert([
        {
          user_id: userId,
          message: message,
          response: aiResponse,
          message_type: 'user',
          context_data: contextData
        },
        {
          user_id: userId,
          message: aiResponse,
          response: aiResponse,
          message_type: 'assistant',
          context_data: financialContext
        }
      ]);

    // Generate AI recommendations based on the conversation
    const shouldGenerateRecommendations = message.toLowerCase().includes('save') || 
                                         message.toLowerCase().includes('invest') ||
                                         message.toLowerCase().includes('budget') ||
                                         message.toLowerCase().includes('goal');

    if (shouldGenerateRecommendations && financialContext.profile) {
      const recommendationPrompt = `Based on the user's financial profile and question "${message}", generate 1-2 specific, actionable financial recommendations. Each should be under 100 characters for the title and description.`;
      
      const recResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are a financial advisor. Generate specific recommendations in JSON format with title, description, type, and expected_impact fields.' },
            { role: 'user', content: recommendationPrompt }
          ],
        }),
      });

      if (recResponse.ok) {
        const recData = await recResponse.json();
        const recommendations = recData.choices[0].message.content;
        
        try {
          const parsedRecs = JSON.parse(recommendations);
          if (Array.isArray(parsedRecs)) {
            for (const rec of parsedRecs) {
              await supabase
                .from('ai_recommendations')
                .insert({
                  user_id: userId,
                  type: rec.type || 'savings',
                  title: rec.title,
                  description: rec.description,
                  confidence_score: 0.8,
                  expected_impact: rec.expected_impact || null,
                  priority: 'medium'
                });
            }
          }
        } catch (e) {
          console.log('Could not parse recommendations as JSON:', e);
        }
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: financialContext 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-finance-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});