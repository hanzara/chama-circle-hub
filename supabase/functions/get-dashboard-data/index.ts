import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardData {
  walletBalance: number;
  recentTransactions: any[];
  upcomingContributions: any[];
  activeChamas: any[];
  savingsGoals: any[];
  notifications: any[];
  reputationScore: number;
  verified: boolean;
}

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

    const { userId } = await req.json();
    
    if (userId !== user.id) {
      throw new Error('User ID mismatch');
    }

    console.log('Fetching dashboard data for user:', userId);

    // Initialize dashboard data
    const dashboardData: DashboardData = {
      walletBalance: 0,
      recentTransactions: [],
      upcomingContributions: [],
      activeChamas: [],
      savingsGoals: [],
      notifications: [],
      reputationScore: 0,
      verified: false,
    };

    // 1. Get wallet balance from user_wallets
    const { data: walletData } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    dashboardData.walletBalance = walletData?.balance || 0;

    // 2. Get recent transactions (last 10)
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('id, type, amount, description, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    dashboardData.recentTransactions = transactions || [];

    // 3. Get active chamas for the user
    const { data: userChamas } = await supabase
      .from('chama_members')
      .select(`
        id,
        chama_id,
        role,
        chamas!inner (
          id,
          name,
          total_savings,
          current_members,
          max_members,
          contribution_amount,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (userChamas && userChamas.length > 0) {
      // Use Map to deduplicate chamas by ID
      const chamaMap = new Map();
      
      userChamas.forEach((member: any) => {
        const chamaId = member.chamas.id;
        // Only add if not already in map, or if this role has higher priority
        if (!chamaMap.has(chamaId) || member.role === 'admin') {
          chamaMap.set(chamaId, {
            id: member.chamas.id,
            name: member.chamas.name,
            total_savings: member.chamas.total_savings,
            current_members: member.chamas.current_members,
            max_members: member.chamas.max_members,
            contribution_amount: member.chamas.contribution_amount,
            status: member.chamas.status,
            user_role: member.role,
            member_id: member.id,
          });
        }
      });
      
      dashboardData.activeChamas = Array.from(chamaMap.values());
    }

    // 4. Get upcoming contributions (next 5)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingContributions: any[] = [];
    
    // For each chama membership, check if user has pending contributions
    // Track unique chamas to avoid duplicates
    const processedChamas = new Set<string>();
    
    for (const chamaData of dashboardData.activeChamas) {
      // Skip if already processed this chama
      if (processedChamas.has(chamaData.id)) continue;
      processedChamas.add(chamaData.id);
      
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { data: recentContributions } = await supabase
        .from('chama_contributions_new')
        .select('contribution_date')
        .eq('chama_id', chamaData.id)
        .eq('member_id', chamaData.member_id)
        .gte('contribution_date', lastMonth.toISOString().split('T')[0])
        .order('contribution_date', { ascending: false })
        .limit(1);

      if (!recentContributions || recentContributions.length === 0) {
        // User hasn't contributed recently, add to upcoming
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

        upcomingContributions.push({
          id: `upcoming-${chamaData.id}-${chamaData.member_id}`,
          chama_id: chamaData.id,
          chama_name: chamaData.name,
          amount: chamaData.contribution_amount,
          due_date: dueDate.toISOString(),
          days_until_due: 7,
          status: 'upcoming',
          member_role: chamaData.user_role,
        });
      }
    }

    dashboardData.upcomingContributions = upcomingContributions.slice(0, 5);

    // 5. Get savings goals
    const { data: savingsGoals } = await supabase
      .from('financial_goals')
      .select('id, title, target_amount, current_amount, target_date, category, priority, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    dashboardData.savingsGoals = savingsGoals || [];

    // 6. Generate some sample notifications
    const notifications = [];
    
    // Payment reminders for overdue contributions
    if (upcomingContributions.length > 0) {
      notifications.push({
        id: 'payment-reminder-1',
        type: 'payment_reminder',
        title: 'Contribution Due Soon',
        message: `You have ${upcomingContributions.length} upcoming contribution(s) this month`,
        priority: 'medium',
        created_at: new Date().toISOString(),
        read: false,
      });
    }

    // Low balance warning
    if (dashboardData.walletBalance < 1000) {
      notifications.push({
        id: 'low-balance-1',
        type: 'low_balance',
        title: 'Low Wallet Balance',
        message: 'Your wallet balance is running low. Consider adding funds.',
        priority: 'medium',
        created_at: new Date().toISOString(),
        read: false,
      });
    }

    dashboardData.notifications = notifications;

    // 7. Set default values (no verified column in user_profiles)
    dashboardData.reputationScore = 75;
    dashboardData.verified = false;

    console.log('Dashboard data compiled successfully');

    return new Response(
      JSON.stringify(dashboardData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});