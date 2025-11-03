import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";

    // Basic auth header validation
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      throw new Error("Unauthorized: missing Authorization header");
    }

    const token = authHeader.split(" ")[1];

    // Decode JWT payload (verify_jwt is handled by Supabase gateway)
    const decodeJwt = (t: string) => {
      const payload = t.split('.')[1] ?? '';
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      const json = atob(padded);
      return JSON.parse(json);
    };

    const jwtPayload = decodeJwt(token);
    const userId = jwtPayload?.sub as string | undefined;
    if (!userId) {
      throw new Error("Unauthorized: invalid token payload");
    }

    // Admin client for secure DB operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("[sync-wallet-balance] Start for user:", userId);

    // Helper to sum amounts safely
    const sumAmounts = (rows: Array<{ amount: number | null }> | null | undefined) =>
      rows?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0;

    // 1) Wallet-based deposits (covers Paystack, Airtel, internal credits, etc.)
    // Some older rows may use column `transaction_type`; new rows use `type`.
    const [walletDepositsType, walletDepositsLegacy] = await Promise.all([
      supabaseAdmin
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "deposit")
        .in("status", ["completed", "success"]),
      supabaseAdmin
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("transaction_type", "deposit")
        .in("status", ["completed", "success"]),
    ]);

    if (walletDepositsType.error) console.error("walletDepositsType error", walletDepositsType.error);
    if (walletDepositsLegacy.error) console.error("walletDepositsLegacy error", walletDepositsLegacy.error);

    const walletDeposits = sumAmounts(walletDepositsType.data) + sumAmounts(walletDepositsLegacy.data);

    // 2) Legacy M-Pesa deposits table (if used in your flow)
    const { data: mpesaDeposits, error: mpesaError } = await supabaseAdmin
      .from("mpesa_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "success")
      .eq("purpose", "deposit");

    if (mpesaError) console.error("mpesaDeposits error", mpesaError);
    const mpesaDepositTotal = sumAmounts(mpesaDeposits);

    // TOTAL deposits
    const totalDeposits = walletDeposits + mpesaDepositTotal;

    // 3) Withdrawals from wallet_transactions
    const [walletWithdrawalsType, walletWithdrawalsLegacy] = await Promise.all([
      supabaseAdmin
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "withdrawal")
        .in("status", ["completed", "success"]),
      supabaseAdmin
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("transaction_type", "withdrawal")
        .in("status", ["completed", "success"]),
    ]);

    if (walletWithdrawalsType.error) console.error("walletWithdrawalsType error", walletWithdrawalsType.error);
    if (walletWithdrawalsLegacy.error) console.error("walletWithdrawalsLegacy error", walletWithdrawalsLegacy.error);

    const sumAbs = (rows: Array<{ amount: number | null }> | null | undefined) =>
      rows?.reduce((sum, r) => sum + Math.abs(Number(r.amount) || 0), 0) || 0;

    const totalWithdrawals = sumAbs(walletWithdrawalsType.data) + sumAbs(walletWithdrawalsLegacy.data);

    // 4) Expected balance
    const expectedBalance = totalDeposits - totalWithdrawals;

    // 5) Upsert to user_central_wallets
    const { error: upsertError } = await supabaseAdmin
      .from("user_central_wallets")
      .upsert(
        {
          user_id: userId,
          balance: expectedBalance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("wallet upsert error", upsertError);
      throw new Error("Failed to update wallet balance");
    }

    // 6) Optional audit
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      action: "wallet_balance_sync",
      resource_type: "wallet",
      resource_id: userId,
      new_values: {
        balance: expectedBalance,
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
      },
    });

    console.log("[sync-wallet-balance] Deposits:", totalDeposits, "Withdrawals:", totalWithdrawals, "=>", expectedBalance);

    return new Response(
      JSON.stringify({
        success: true,
        balance: expectedBalance,
        details: {
          deposits: totalDeposits,
          mpesaDeposits: mpesaDepositTotal,
          walletDeposits,
          withdrawals: totalWithdrawals,
        },
        currency: "KES",
        synced_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[sync-wallet-balance] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
