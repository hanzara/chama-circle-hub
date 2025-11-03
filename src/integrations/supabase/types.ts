export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          message: string
          message_type: string
          response: string
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          message: string
          message_type: string
          response: string
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string
          expected_impact: number | null
          expires_at: string | null
          id: string
          impact_description: string | null
          priority: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description: string
          expected_impact?: number | null
          expires_at?: string | null
          id?: string
          impact_description?: string | null
          priority?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          expected_impact?: number | null
          expires_at?: string | null
          id?: string
          impact_description?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_name: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_enhanced: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bill_providers: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          service_fee: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          service_fee?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          service_fee?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_alerts: {
        Row: {
          alert_type: string
          budget_id: string | null
          category: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          percentage_used: number | null
          user_id: string
        }
        Insert: {
          alert_type: string
          budget_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          percentage_used?: number | null
          user_id: string
        }
        Update: {
          alert_type?: string
          budget_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          percentage_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_budget_alerts_budget"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          alert_threshold: number | null
          allocated_amount: number | null
          budget_id: string
          budget_limit: number
          category: string
          created_at: string
          id: string
          remaining_balance: number | null
          spent_amount: number
          updated_at: string
        }
        Insert: {
          alert_threshold?: number | null
          allocated_amount?: number | null
          budget_id: string
          budget_limit?: number
          category: string
          created_at?: string
          id?: string
          remaining_balance?: number | null
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          alert_threshold?: number | null
          allocated_amount?: number | null
          budget_id?: string
          budget_limit?: number
          category?: string
          created_at?: string
          id?: string
          remaining_balance?: number | null
          spent_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_budget_categories_budget"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "user_budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          pending_balance: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          pending_balance?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          pending_balance?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chama_activities: {
        Row: {
          activity_type: string
          amount: number | null
          chama_id: string | null
          created_at: string | null
          description: string
          id: string
          member_id: string | null
        }
        Insert: {
          activity_type: string
          amount?: number | null
          chama_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          member_id?: string | null
        }
        Update: {
          activity_type?: string
          amount?: number | null
          chama_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_activities_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_activities_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_activities_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_announcement_comments: {
        Row: {
          announcement_id: string
          comment_text: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          comment_text: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "chama_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_announcement_likes: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_announcement_likes_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "chama_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_announcement_shares: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          share_type: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          share_type: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          share_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_announcement_shares_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "chama_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_audit_logs: {
        Row: {
          action: string
          actor_id: string
          chama_id: string
          created_at: string | null
          details: Json | null
          id: string
          new_value: string | null
          old_value: string | null
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          chama_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          chama_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_audit_logs_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_audit_trail: {
        Row: {
          action: string
          actor_id: string | null
          amount: number | null
          chama_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_member_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          amount?: number | null
          chama_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_member_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          amount?: number | null
          chama_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_audit_trail_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_audit_trail_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_audit_trail_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_audit_trail_target_member_id_fkey"
            columns: ["target_member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_audit_trail_target_member_id_fkey"
            columns: ["target_member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      chama_central_wallets: {
        Row: {
          balance: number
          chama_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number
          chama_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          balance?: number
          chama_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_central_wallets_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: true
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_connections: {
        Row: {
          connection_type: string | null
          created_at: string | null
          id: string
          message: string | null
          requested_by: string
          requester_chama_id: string
          status: string | null
          target_chama_id: string
          updated_at: string | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          requested_by: string
          requester_chama_id: string
          status?: string | null
          target_chama_id: string
          updated_at?: string | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          requested_by?: string
          requester_chama_id?: string
          status?: string | null
          target_chama_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chama_contributions: {
        Row: {
          amount: number
          chama_id: string | null
          created_at: string | null
          id: string
          member_id: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount: number
          chama_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          chama_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_contributions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_contributions_new: {
        Row: {
          amount: number
          chama_id: string | null
          contribution_date: string
          created_at: string | null
          id: string
          member_id: string | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          chama_id?: string | null
          contribution_date?: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          chama_id?: string | null
          contribution_date?: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_contributions_new_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_contributions_new_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_contributions_new_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_contributions_new_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_email_subscriptions: {
        Row: {
          chama_id: string
          created_at: string | null
          email_address: string
          id: string
          subscribed_to_announcements: boolean | null
          subscribed_to_contributions: boolean | null
          subscribed_to_loans: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chama_id: string
          created_at?: string | null
          email_address: string
          id?: string
          subscribed_to_announcements?: boolean | null
          subscribed_to_contributions?: boolean | null
          subscribed_to_loans?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chama_id?: string
          created_at?: string | null
          email_address?: string
          id?: string
          subscribed_to_announcements?: boolean | null
          subscribed_to_contributions?: boolean | null
          subscribed_to_loans?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_email_subscriptions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_follows: {
        Row: {
          chama_id: string
          created_at: string
          follower_id: string
          id: string
        }
        Insert: {
          chama_id: string
          created_at?: string
          follower_id: string
          id?: string
        }
        Update: {
          chama_id?: string
          created_at?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      chama_loan_repayments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          loan_id: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          loan_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          loan_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "chama_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_loan_requests: {
        Row: {
          amount: number
          amount_paid: number | null
          amount_remaining: number | null
          approved_at: string | null
          approved_by: string | null
          borrower_id: string | null
          chama_id: string | null
          created_at: string | null
          disbursement_status: boolean | null
          duration_months: number
          funds_sent_at: string | null
          id: string
          interest_rate: number | null
          member_payment_number: string | null
          monthly_payment: number | null
          purpose: string
          report: string | null
          reward_status: boolean | null
          status: string | null
          total_repayment: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          amount_remaining?: number | null
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          disbursement_status?: boolean | null
          duration_months: number
          funds_sent_at?: string | null
          id?: string
          interest_rate?: number | null
          member_payment_number?: string | null
          monthly_payment?: number | null
          purpose: string
          report?: string | null
          reward_status?: boolean | null
          status?: string | null
          total_repayment?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          amount_remaining?: number | null
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          disbursement_status?: boolean | null
          duration_months?: number
          funds_sent_at?: string | null
          id?: string
          interest_rate?: number | null
          member_payment_number?: string | null
          monthly_payment?: number | null
          purpose?: string
          report?: string | null
          reward_status?: boolean | null
          status?: string | null
          total_repayment?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_loan_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_loan_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_loan_requests_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_loan_requests_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_loan_requests_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_loans: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          borrower_id: string | null
          chama_id: string | null
          created_at: string | null
          disbursement_status: boolean | null
          due_date: string | null
          duration_months: number
          funds_sent_at: string | null
          id: string
          interest_rate: number | null
          member_payment_number: string | null
          metadata: Json | null
          outstanding: number | null
          purpose: string | null
          repaid_amount: number | null
          repayment_schedule: Json | null
          report: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          disbursement_status?: boolean | null
          due_date?: string | null
          duration_months: number
          funds_sent_at?: string | null
          id?: string
          interest_rate?: number | null
          member_payment_number?: string | null
          metadata?: Json | null
          outstanding?: number | null
          purpose?: string | null
          repaid_amount?: number | null
          repayment_schedule?: Json | null
          report?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          disbursement_status?: boolean | null
          due_date?: string | null
          duration_months?: number
          funds_sent_at?: string | null
          id?: string
          interest_rate?: number | null
          member_payment_number?: string | null
          metadata?: Json | null
          outstanding?: number | null
          purpose?: string | null
          repaid_amount?: number | null
          repayment_schedule?: Json | null
          report?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_loans_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_loans_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_loans_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_member_savings_accounts: {
        Row: {
          account_name: string
          account_type: string
          auto_save_amount: number | null
          auto_save_enabled: boolean | null
          chama_id: string
          created_at: string | null
          current_balance: number | null
          id: string
          interest_rate: number | null
          member_id: string
          minimum_balance: number | null
          monthly_target: number | null
          status: string | null
          target_amount: number | null
          updated_at: string | null
          withdrawal_fee: number | null
        }
        Insert: {
          account_name: string
          account_type?: string
          auto_save_amount?: number | null
          auto_save_enabled?: boolean | null
          chama_id: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          interest_rate?: number | null
          member_id: string
          minimum_balance?: number | null
          monthly_target?: number | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string | null
          withdrawal_fee?: number | null
        }
        Update: {
          account_name?: string
          account_type?: string
          auto_save_amount?: number | null
          auto_save_enabled?: boolean | null
          chama_id?: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          interest_rate?: number | null
          member_id?: string
          minimum_balance?: number | null
          monthly_target?: number | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string | null
          withdrawal_fee?: number | null
        }
        Relationships: []
      }
      chama_members: {
        Row: {
          auto_debit_enabled: boolean | null
          chama_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_contribution_date: string | null
          merry_balance: number | null
          mgr_balance: number | null
          mgr_turn_date: string | null
          mgr_turn_order: number | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          role: string | null
          savings_balance: number | null
          total_contributed: number | null
          user_id: string
          withdrawal_locked: boolean | null
        }
        Insert: {
          auto_debit_enabled?: boolean | null
          chama_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_contribution_date?: string | null
          merry_balance?: number | null
          mgr_balance?: number | null
          mgr_turn_date?: string | null
          mgr_turn_order?: number | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          role?: string | null
          savings_balance?: number | null
          total_contributed?: number | null
          user_id: string
          withdrawal_locked?: boolean | null
        }
        Update: {
          auto_debit_enabled?: boolean | null
          chama_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_contribution_date?: string | null
          merry_balance?: number | null
          mgr_balance?: number | null
          mgr_turn_date?: string | null
          mgr_turn_order?: number | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          role?: string | null
          savings_balance?: number | null
          total_contributed?: number | null
          user_id?: string
          withdrawal_locked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_members_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_messages: {
        Row: {
          chama_id: string | null
          id: string
          message: string
          sender_id: string | null
          sent_at: string | null
        }
        Insert: {
          chama_id?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Update: {
          chama_id?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_messages_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_metrics: {
        Row: {
          average_repayment_performance: number | null
          calculated_at: string | null
          chama_id: string | null
          created_at: string | null
          id: string
          net_worth: number | null
          pending_votes_count: number | null
          roi_percentage: number | null
          upcoming_contributions_count: number | null
        }
        Insert: {
          average_repayment_performance?: number | null
          calculated_at?: string | null
          chama_id?: string | null
          created_at?: string | null
          id?: string
          net_worth?: number | null
          pending_votes_count?: number | null
          roi_percentage?: number | null
          upcoming_contributions_count?: number | null
        }
        Update: {
          average_repayment_performance?: number | null
          calculated_at?: string | null
          chama_id?: string | null
          created_at?: string | null
          id?: string
          net_worth?: number | null
          pending_votes_count?: number | null
          roi_percentage?: number | null
          upcoming_contributions_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_metrics_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: true
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_mpesa_methods: {
        Row: {
          account_number: string | null
          chama_id: string
          created_at: string
          id: string
          is_active: boolean
          method_name: string
          method_number: string
          method_type: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          chama_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          method_name: string
          method_number: string
          method_type: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          chama_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          method_name?: string
          method_number?: string
          method_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_mpesa_methods_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_notifications: {
        Row: {
          body: string | null
          chama_id: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          chama_id: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          chama_id?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chama_notifications_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_payment_verifications: {
        Row: {
          amount: number
          chama_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          membership_id: string | null
          payment_method: string
          payment_reference: string
          payment_status: string
          updated_at: string | null
          user_id: string
          verification_data: Json | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          chama_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          membership_id?: string | null
          payment_method: string
          payment_reference: string
          payment_status?: string
          updated_at?: string | null
          user_id: string
          verification_data?: Json | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          chama_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          membership_id?: string | null
          payment_method?: string
          payment_reference?: string
          payment_status?: string
          updated_at?: string | null
          user_id?: string
          verification_data?: Json | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_payment_verifications_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_payment_verifications_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_payment_verifications_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_savings_goals: {
        Row: {
          chama_id: string | null
          created_at: string | null
          current_amount: number | null
          goal_name: string
          id: string
          member_id: string | null
          status: string | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          chama_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          goal_name: string
          id?: string
          member_id?: string | null
          status?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          chama_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          goal_name?: string
          id?: string
          member_id?: string | null
          status?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_savings_goals_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_savings_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_savings_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_savings_transactions: {
        Row: {
          amount: number
          balance_after: number
          chama_id: string
          created_at: string | null
          description: string | null
          id: string
          member_id: string
          payment_method: string | null
          processed_by: string | null
          reference_number: string | null
          savings_account_id: string
          status: string | null
          transaction_fee: number | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          chama_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          member_id: string
          payment_method?: string | null
          processed_by?: string | null
          reference_number?: string | null
          savings_account_id: string
          status?: string | null
          transaction_fee?: number | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          chama_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          member_id?: string
          payment_method?: string | null
          processed_by?: string | null
          reference_number?: string | null
          savings_account_id?: string
          status?: string | null
          transaction_fee?: number | null
          transaction_type?: string
        }
        Relationships: []
      }
      chama_settings: {
        Row: {
          chama_id: string | null
          created_at: string | null
          id: string
          late_payment_penalty: number | null
          loan_interest_rate: number | null
          max_loan_amount: number | null
          updated_at: string | null
          voting_threshold: number | null
        }
        Insert: {
          chama_id?: string | null
          created_at?: string | null
          id?: string
          late_payment_penalty?: number | null
          loan_interest_rate?: number | null
          max_loan_amount?: number | null
          updated_at?: string | null
          voting_threshold?: number | null
        }
        Update: {
          chama_id?: string | null
          created_at?: string | null
          id?: string
          late_payment_penalty?: number | null
          loan_interest_rate?: number | null
          max_loan_amount?: number | null
          updated_at?: string | null
          voting_threshold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_settings_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: true
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_votes: {
        Row: {
          chama_id: string | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          initiated_by: string | null
          no_votes: number | null
          reference_id: string | null
          status: string | null
          title: string
          total_eligible_voters: number | null
          vote_type: string
          yes_votes: number | null
        }
        Insert: {
          chama_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          initiated_by?: string | null
          no_votes?: number | null
          reference_id?: string | null
          status?: string | null
          title: string
          total_eligible_voters?: number | null
          vote_type: string
          yes_votes?: number | null
        }
        Update: {
          chama_id?: string | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          initiated_by?: string | null
          no_votes?: number | null
          reference_id?: string | null
          status?: string | null
          title?: string
          total_eligible_voters?: number | null
          vote_type?: string
          yes_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_votes_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_votes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_votes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chama_wallet_transactions: {
        Row: {
          amount: number
          chama_id: string
          created_at: string | null
          description: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          processed_by: string | null
          status: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          chama_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          processed_by?: string | null
          status?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          chama_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          processed_by?: string | null
          status?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_wallet_transactions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chama_wallet_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "chama_wallet_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chamas: {
        Row: {
          admin_id: string | null
          category_id: string | null
          contribution_amount: number
          contribution_frequency: string
          created_at: string | null
          created_by: string
          current_members: number | null
          description: string | null
          funds_locked: boolean | null
          id: string
          is_marketplace_chama: boolean | null
          joining_fee: number | null
          logo_url: string | null
          max_members: number | null
          name: string
          purchase_amount: number | null
          purchased_at: string | null
          purchased_by: string | null
          require_payment: boolean | null
          rules: string | null
          schedule: Json | null
          settings: Json | null
          status: string | null
          total_savings: number | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          category_id?: string | null
          contribution_amount: number
          contribution_frequency?: string
          created_at?: string | null
          created_by: string
          current_members?: number | null
          description?: string | null
          funds_locked?: boolean | null
          id?: string
          is_marketplace_chama?: boolean | null
          joining_fee?: number | null
          logo_url?: string | null
          max_members?: number | null
          name: string
          purchase_amount?: number | null
          purchased_at?: string | null
          purchased_by?: string | null
          require_payment?: boolean | null
          rules?: string | null
          schedule?: Json | null
          settings?: Json | null
          status?: string | null
          total_savings?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          category_id?: string | null
          contribution_amount?: number
          contribution_frequency?: string
          created_at?: string | null
          created_by?: string
          current_members?: number | null
          description?: string | null
          funds_locked?: boolean | null
          id?: string
          is_marketplace_chama?: boolean | null
          joining_fee?: number | null
          logo_url?: string | null
          max_members?: number | null
          name?: string
          purchase_amount?: number | null
          purchased_at?: string | null
          purchased_by?: string | null
          require_payment?: boolean | null
          rules?: string | null
          schedule?: Json | null
          settings?: Json | null
          status?: string | null
          total_savings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chamas_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "chama_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          created_at: string | null
          created_by: string
          current_attendees: number | null
          description: string | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_attendees?: number | null
          description?: string | null
          event_date: string
          event_time: string
          event_type: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_attendees?: number | null
          description?: string | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: number
          phone: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: number
          phone?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: number
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_phone_fkey"
            columns: ["phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string
          current_usage: number
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean
          maximum_discount: number | null
          merchant_id: string
          minimum_spend: number | null
          terms_conditions: string | null
          title: string
          updated_at: string
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          current_usage?: number
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          maximum_discount?: number | null
          merchant_id: string
          minimum_spend?: number | null
          terms_conditions?: string | null
          title: string
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          created_at?: string
          current_usage?: number
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          maximum_discount?: number | null
          merchant_id?: string
          minimum_spend?: number | null
          terms_conditions?: string | null
          title?: string
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_deals_merchant"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enhanced_wallet_transactions: {
        Row: {
          created_at: string
          description: string | null
          exchange_rate: number | null
          external_id: string | null
          fee_amount: number | null
          fee_currency: string | null
          from_amount: number | null
          from_currency: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          reference_id: string | null
          status: string
          to_amount: number | null
          to_currency: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exchange_rate?: number | null
          external_id?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          from_amount?: number | null
          from_currency?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string
          to_amount?: number | null
          to_currency?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exchange_rate?: number | null
          external_id?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          from_amount?: number | null
          from_currency?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string
          to_amount?: number | null
          to_currency?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          event_id: string
          id: string
          rsvp_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          rsvp_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          rsvp_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          source: string | null
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          source?: string | null
          to_currency: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          source?: string | null
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_collections: {
        Row: {
          amount: number
          collected_at: string | null
          collection_method: string | null
          created_at: string | null
          currency: string | null
          fee_type: string
          id: string
          metadata: Json | null
          paystack_reference: string | null
          platform_account_id: string | null
          source_transaction_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          collected_at?: string | null
          collection_method?: string | null
          created_at?: string | null
          currency?: string | null
          fee_type: string
          id?: string
          metadata?: Json | null
          paystack_reference?: string | null
          platform_account_id?: string | null
          source_transaction_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          collected_at?: string | null
          collection_method?: string | null
          created_at?: string | null
          currency?: string | null
          fee_type?: string
          id?: string
          metadata?: Json | null
          paystack_reference?: string | null
          platform_account_id?: string | null
          source_transaction_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_collections_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_configurations: {
        Row: {
          created_at: string | null
          fee_type: string
          id: string
          is_active: boolean | null
          maximum_fee: number | null
          minimum_fee: number | null
          percentage_rate: number | null
          tiers: Json | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee_type: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          percentage_rate?: number | null
          tiers?: Json | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee_type?: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          percentage_rate?: number | null
          tiers?: Json | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string
          created_at: string | null
          current_amount: number | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          module_title: string
          points_earned: number | null
          progress_percentage: number | null
          time_spent_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          module_title: string
          points_earned?: number | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          module_title?: string
          points_earned?: number | null
          progress_percentage?: number | null
          time_spent_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          ai_confidence: number | null
          amount: number
          auto_categorized: boolean | null
          budget_category: string | null
          budget_transaction_type: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          merchant_name: string | null
          mpesa_account_number: string | null
          mpesa_paybill_number: string | null
          mpesa_phone_number: string | null
          mpesa_receipt_number: string | null
          mpesa_till_number: string | null
          notes: string | null
          payment_method: string | null
          recurring_pattern: string | null
          subcategory: string | null
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          amount: number
          auto_categorized?: boolean | null
          budget_category?: string | null
          budget_transaction_type?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          merchant_name?: string | null
          mpesa_account_number?: string | null
          mpesa_paybill_number?: string | null
          mpesa_phone_number?: string | null
          mpesa_receipt_number?: string | null
          mpesa_till_number?: string | null
          notes?: string | null
          payment_method?: string | null
          recurring_pattern?: string | null
          subcategory?: string | null
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          amount?: number
          auto_categorized?: boolean | null
          budget_category?: string | null
          budget_transaction_type?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          merchant_name?: string | null
          mpesa_account_number?: string | null
          mpesa_paybill_number?: string | null
          mpesa_phone_number?: string | null
          mpesa_receipt_number?: string | null
          mpesa_till_number?: string | null
          notes?: string | null
          payment_method?: string | null
          recurring_pattern?: string | null
          subcategory?: string | null
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      fraud_detection_logs: {
        Row: {
          action_taken: string | null
          created_at: string | null
          details: Json
          event_type: string
          id: string
          ip_address: unknown
          location_data: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          details: Json
          event_type: string
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown
          location_data?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      game_tournaments: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_time: string
          entry_fee: number
          game_type: string
          id: string
          max_participants: number | null
          name: string
          prize_pool: number | null
          registration_deadline: string
          rules: Json | null
          start_time: string
          status: string | null
          tournament_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_time: string
          entry_fee?: number
          game_type: string
          id?: string
          max_participants?: number | null
          name: string
          prize_pool?: number | null
          registration_deadline: string
          rules?: Json | null
          start_time: string
          status?: string | null
          tournament_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_time?: string
          entry_fee?: number
          game_type?: string
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number | null
          registration_deadline?: string
          rules?: Json | null
          start_time?: string
          status?: string | null
          tournament_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotspot_ratings: {
        Row: {
          created_at: string | null
          hotspot_id: string
          id: string
          rating: number
          reliability_rating: number | null
          review_text: string | null
          session_id: string | null
          speed_rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hotspot_id: string
          id?: string
          rating: number
          reliability_rating?: number | null
          review_text?: string | null
          session_id?: string | null
          speed_rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hotspot_id?: string
          id?: string
          rating?: number
          reliability_rating?: number | null
          review_text?: string | null
          session_id?: string | null
          speed_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_ratings_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "wifi_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "wifi_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_sessions: {
        Row: {
          buyer_id: string | null
          bytes_used: number | null
          device_info: Json | null
          expires_at: string | null
          hotspot_id: string | null
          id: string
          started_at: string | null
          status: string | null
          voucher_code: string | null
        }
        Insert: {
          buyer_id?: string | null
          bytes_used?: number | null
          device_info?: Json | null
          expires_at?: string | null
          hotspot_id?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          voucher_code?: string | null
        }
        Update: {
          buyer_id?: string | null
          bytes_used?: number | null
          device_info?: Json | null
          expires_at?: string | null
          hotspot_id?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_sessions_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspots: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          max_concurrent: number | null
          name: string
          proof_docs: Json | null
          seller_id: string | null
          ssid: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_concurrent?: number | null
          name: string
          proof_docs?: Json | null
          seller_id?: string | null
          ssid?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          max_concurrent?: number | null
          name?: string
          proof_docs?: Json | null
          seller_id?: string | null
          ssid?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspots_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_advisory: {
        Row: {
          advisor_fee: number | null
          advisory_type: string
          created_at: string | null
          id: string
          investment_amount: number | null
          recommendations: Json | null
          risk_profile: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_fee?: number | null
          advisory_type: string
          created_at?: string | null
          id?: string
          investment_amount?: number | null
          recommendations?: Json | null
          risk_profile?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_fee?: number | null
          advisory_type?: string
          created_at?: string | null
          id?: string
          investment_amount?: number | null
          recommendations?: Json | null
          risk_profile?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          is_premium: boolean | null
          risk_score: number | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_premium?: boolean | null
          risk_score?: number | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_premium?: boolean | null
          risk_score?: number | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      investment_projects: {
        Row: {
          business_owner_id: string
          category: string
          created_at: string | null
          current_funding: number | null
          description: string
          duration_months: number
          funding_deadline: string | null
          id: string
          location: string | null
          minimum_investment: number | null
          project_start_date: string | null
          projected_roi: number
          risk_score: number | null
          status: string | null
          target_amount: number
          title: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          business_owner_id: string
          category: string
          created_at?: string | null
          current_funding?: number | null
          description: string
          duration_months: number
          funding_deadline?: string | null
          id?: string
          location?: string | null
          minimum_investment?: number | null
          project_start_date?: string | null
          projected_roi: number
          risk_score?: number | null
          status?: string | null
          target_amount: number
          title: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          business_owner_id?: string
          category?: string
          created_at?: string | null
          current_funding?: number | null
          description?: string
          duration_months?: number
          funding_deadline?: string | null
          id?: string
          location?: string | null
          minimum_investment?: number | null
          project_start_date?: string | null
          projected_roi?: number
          risk_score?: number | null
          status?: string | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string | null
          document_type: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_challenges: {
        Row: {
          category: string
          completion_count: number | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          questions: Json
          reward_amount: number | null
          reward_points: number | null
          time_limit: number | null
          title: string
        }
        Insert: {
          category: string
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          questions: Json
          reward_amount?: number | null
          reward_points?: number | null
          time_limit?: number | null
          title: string
        }
        Update: {
          category?: string
          completion_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          reward_amount?: number | null
          reward_points?: number | null
          time_limit?: number | null
          title?: string
        }
        Relationships: []
      }
      learning_content: {
        Row: {
          category: string
          content_body: string | null
          content_type: string
          content_url: string | null
          created_at: string
          description: string | null
          difficulty_level: string
          estimated_duration: number | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_body?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_body?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lender_ratings: {
        Row: {
          borrower_id: string
          communication_rating: number | null
          created_at: string
          id: string
          lender_id: string
          loan_application_id: string | null
          overall_rating: number | null
          reliability_rating: number | null
          review_text: string | null
          terms_rating: number | null
          updated_at: string
        }
        Insert: {
          borrower_id: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          lender_id: string
          loan_application_id?: string | null
          overall_rating?: number | null
          reliability_rating?: number | null
          review_text?: string | null
          terms_rating?: number | null
          updated_at?: string
        }
        Update: {
          borrower_id?: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          lender_id?: string
          loan_application_id?: string | null
          overall_rating?: number | null
          reliability_rating?: number | null
          review_text?: string | null
          terms_rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lender_ratings_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_accounts: {
        Row: {
          account_name: string | null
          account_number: string | null
          account_type: string
          authorization_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_used_at: string | null
          metadata: Json | null
          phone_number: string | null
          provider: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          account_type: string
          authorization_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          phone_number?: string | null
          provider: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          account_type?: string
          authorization_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          metadata?: Json | null
          phone_number?: string | null
          provider?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_competition_players: {
        Row: {
          competition_id: string | null
          current_score: number | null
          final_position: number | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          competition_id?: string | null
          current_score?: number | null
          final_position?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          competition_id?: string | null
          current_score?: number | null
          final_position?: number | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_competition_players_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "live_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_competitions: {
        Row: {
          competition_type: string
          created_at: string | null
          current_players: number | null
          description: string | null
          end_time: string | null
          entry_fee: number | null
          game_state: Json | null
          id: string
          max_players: number | null
          name: string
          start_time: string | null
          status: string | null
        }
        Insert: {
          competition_type: string
          created_at?: string | null
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_state?: Json | null
          id?: string
          max_players?: number | null
          name: string
          start_time?: string | null
          status?: string | null
        }
        Update: {
          competition_type?: string
          created_at?: string | null
          current_players?: number | null
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_state?: Json | null
          id?: string
          max_players?: number | null
          name?: string
          start_time?: string | null
          status?: string | null
        }
        Relationships: []
      }
      loan_agreements: {
        Row: {
          borrower_id: string
          created_at: string | null
          duration_months: number
          end_date: string | null
          id: string
          interest_rate: number
          investor_id: string
          loan_offer_id: string | null
          monthly_payment: number
          principal_amount: number
          repayment_schedule: Json | null
          signed_at: string | null
          start_date: string | null
          status: string | null
          terms_and_conditions: string | null
          total_payment: number
        }
        Insert: {
          borrower_id: string
          created_at?: string | null
          duration_months: number
          end_date?: string | null
          id?: string
          interest_rate: number
          investor_id: string
          loan_offer_id?: string | null
          monthly_payment: number
          principal_amount: number
          repayment_schedule?: Json | null
          signed_at?: string | null
          start_date?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          total_payment: number
        }
        Update: {
          borrower_id?: string
          created_at?: string | null
          duration_months?: number
          end_date?: string | null
          id?: string
          interest_rate?: number
          investor_id?: string
          loan_offer_id?: string | null
          monthly_payment?: number
          principal_amount?: number
          repayment_schedule?: Json | null
          signed_at?: string | null
          start_date?: string | null
          status?: string | null
          terms_and_conditions?: string | null
          total_payment?: number
        }
        Relationships: [
          {
            foreignKeyName: "loan_agreements_loan_offer_id_fkey"
            columns: ["loan_offer_id"]
            isOneToOne: false
            referencedRelation: "loan_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          amount: number
          borrower_id: string
          collateral: string | null
          created_at: string
          disbursed_at: string | null
          documents: Json | null
          duration_months: number
          eligibility_score: number | null
          funding_progress: number | null
          guarantors: Json | null
          id: string
          interest_rate: number
          loan_id: string | null
          monthly_payment: number | null
          next_payment_due: string | null
          purpose: string | null
          rejection_reason: string | null
          repayment_method: string | null
          status: string | null
          total_payment: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id: string
          collateral?: string | null
          created_at?: string
          disbursed_at?: string | null
          documents?: Json | null
          duration_months: number
          eligibility_score?: number | null
          funding_progress?: number | null
          guarantors?: Json | null
          id?: string
          interest_rate: number
          loan_id?: string | null
          monthly_payment?: number | null
          next_payment_due?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          repayment_method?: string | null
          status?: string | null
          total_payment?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string
          collateral?: string | null
          created_at?: string
          disbursed_at?: string | null
          documents?: Json | null
          duration_months?: number
          eligibility_score?: number | null
          funding_progress?: number | null
          guarantors?: Json | null
          id?: string
          interest_rate?: number
          loan_id?: string | null
          monthly_payment?: number | null
          next_payment_due?: string | null
          purpose?: string | null
          rejection_reason?: string | null
          repayment_method?: string | null
          status?: string | null
          total_payment?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications_new: {
        Row: {
          approved_at: string | null
          bank_account_number: string | null
          bank_branch: string | null
          bank_name: string | null
          borrower_id: string
          collateral: Json | null
          created_at: string | null
          credit_check_consent: boolean | null
          credit_score: number | null
          data_sharing_consent: boolean | null
          date_of_birth: string
          disbursed_amount: number | null
          due_date: string | null
          email_address: string
          employer_address: string | null
          employer_business_name: string | null
          employment_length_months: number | null
          employment_status: string
          full_name: string
          funded_at: string | null
          funding_progress: number | null
          gender: string | null
          guarantors: Json | null
          id: string
          interest_rate: number | null
          job_title_business_type: string | null
          loan_amount: number
          loan_purpose: string
          loan_term_months: number
          marital_status: string | null
          monthly_income: number
          monthly_payment: number | null
          mpesa_number: string | null
          national_id: string
          nationality: string | null
          phone_number: string
          physical_address: string
          postal_address: string | null
          repaid_amount: number | null
          repayment_frequency: string | null
          repayment_rate: number | null
          repayment_source: string | null
          risk_rating: string | null
          status: string | null
          terms_accepted: boolean | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          borrower_id: string
          collateral?: Json | null
          created_at?: string | null
          credit_check_consent?: boolean | null
          credit_score?: number | null
          data_sharing_consent?: boolean | null
          date_of_birth: string
          disbursed_amount?: number | null
          due_date?: string | null
          email_address: string
          employer_address?: string | null
          employer_business_name?: string | null
          employment_length_months?: number | null
          employment_status: string
          full_name: string
          funded_at?: string | null
          funding_progress?: number | null
          gender?: string | null
          guarantors?: Json | null
          id?: string
          interest_rate?: number | null
          job_title_business_type?: string | null
          loan_amount: number
          loan_purpose: string
          loan_term_months: number
          marital_status?: string | null
          monthly_income: number
          monthly_payment?: number | null
          mpesa_number?: string | null
          national_id: string
          nationality?: string | null
          phone_number: string
          physical_address: string
          postal_address?: string | null
          repaid_amount?: number | null
          repayment_frequency?: string | null
          repayment_rate?: number | null
          repayment_source?: string | null
          risk_rating?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          bank_account_number?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          borrower_id?: string
          collateral?: Json | null
          created_at?: string | null
          credit_check_consent?: boolean | null
          credit_score?: number | null
          data_sharing_consent?: boolean | null
          date_of_birth?: string
          disbursed_amount?: number | null
          due_date?: string | null
          email_address?: string
          employer_address?: string | null
          employer_business_name?: string | null
          employment_length_months?: number | null
          employment_status?: string
          full_name?: string
          funded_at?: string | null
          funding_progress?: number | null
          gender?: string | null
          guarantors?: Json | null
          id?: string
          interest_rate?: number | null
          job_title_business_type?: string | null
          loan_amount?: number
          loan_purpose?: string
          loan_term_months?: number
          marital_status?: string | null
          monthly_income?: number
          monthly_payment?: number | null
          mpesa_number?: string | null
          national_id?: string
          nationality?: string | null
          phone_number?: string
          physical_address?: string
          postal_address?: string | null
          repaid_amount?: number | null
          repayment_frequency?: string | null
          repayment_rate?: number | null
          repayment_source?: string | null
          risk_rating?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loan_disbursements: {
        Row: {
          amount: number
          chama_id: string
          created_at: string | null
          disbursed_by: string
          id: string
          loan_id: string
          member_payment_number: string
          sent_at: string | null
          status: string
        }
        Insert: {
          amount: number
          chama_id: string
          created_at?: string | null
          disbursed_by: string
          id?: string
          loan_id: string
          member_payment_number: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          chama_id?: string
          created_at?: string | null
          disbursed_by?: string
          id?: string
          loan_id?: string
          member_payment_number?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_disbursements_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_disbursements_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "chama_loan_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_investments: {
        Row: {
          created_at: string | null
          expected_return: number
          id: string
          investment_amount: number
          investment_date: string | null
          investor_id: string
          loan_application_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          expected_return: number
          id?: string
          investment_amount: number
          investment_date?: string | null
          investor_id: string
          loan_application_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          expected_return?: number
          id?: string
          investment_amount?: number
          investment_date?: string | null
          investor_id?: string
          loan_application_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_investments_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications_new"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          loan_application_id: string | null
          message: string
          notification_type: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          loan_application_id?: string | null
          message: string
          notification_type: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          loan_application_id?: string | null
          message?: string
          notification_type?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_notifications_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_offers: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          loan_application_id: string
          message: string | null
          offered_amount: number
          offered_interest_rate: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          loan_application_id: string
          message?: string | null
          offered_amount: number
          offered_interest_rate: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          loan_application_id?: string
          message?: string | null
          offered_amount?: number
          offered_interest_rate?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_offers_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_payments: {
        Row: {
          agreement_id: string | null
          amount: number
          created_at: string | null
          due_date: string
          id: string
          interest_amount: number
          paid_date: string | null
          payment_method: string | null
          payment_number: number
          principal_amount: number
          status: string | null
        }
        Insert: {
          agreement_id?: string | null
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          interest_amount: number
          paid_date?: string | null
          payment_method?: string | null
          payment_number: number
          principal_amount: number
          status?: string | null
        }
        Update: {
          agreement_id?: string | null
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          interest_amount?: number
          paid_date?: string | null
          payment_method?: string | null
          payment_number?: number
          principal_amount?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "loan_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_policies: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          policy_type: string
          policy_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          policy_type: string
          policy_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          policy_type?: string
          policy_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          late_fee: number | null
          loan_application_id: string | null
          payment_date: string | null
          payment_method: string
          payment_reference: string | null
          proof_of_payment_url: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          late_fee?: number | null
          loan_application_id?: string | null
          payment_date?: string | null
          payment_method: string
          payment_reference?: string | null
          proof_of_payment_url?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          late_fee?: number | null
          loan_application_id?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_reference?: string | null
          proof_of_payment_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          collateral_required: string | null
          created_at: string
          duration_months: number
          id: string
          interest_rate: number
          lender_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          collateral_required?: string | null
          created_at?: string
          duration_months: number
          id?: string
          interest_rate: number
          lender_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          collateral_required?: string | null
          created_at?: string
          duration_months?: number
          id?: string
          interest_rate?: number
          lender_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      member_credentials: {
        Row: {
          chama_id: string | null
          created_at: string | null
          created_by: string | null
          credential_type: string
          credential_value: string
          id: string
          is_used: boolean | null
          member_id: string | null
          used_at: string | null
        }
        Insert: {
          chama_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credential_type: string
          credential_value: string
          id?: string
          is_used?: boolean | null
          member_id?: string | null
          used_at?: string | null
        }
        Update: {
          chama_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credential_type?: string
          credential_value?: string
          id?: string
          is_used?: boolean | null
          member_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_credentials_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_credentials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_credentials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_credentials_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_credentials_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_credit_scores: {
        Row: {
          chama_id: string
          created_at: string | null
          credit_score: number | null
          id: string
          last_calculated_at: string | null
          late_repayments: number | null
          missed_repayments: number | null
          on_time_repayments: number | null
          total_amount_borrowed: number | null
          total_amount_repaid: number | null
          total_loans_taken: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chama_id: string
          created_at?: string | null
          credit_score?: number | null
          id?: string
          last_calculated_at?: string | null
          late_repayments?: number | null
          missed_repayments?: number | null
          on_time_repayments?: number | null
          total_amount_borrowed?: number | null
          total_amount_repaid?: number | null
          total_loans_taken?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chama_id?: string
          created_at?: string | null
          credit_score?: number | null
          id?: string
          last_calculated_at?: string | null
          late_repayments?: number | null
          missed_repayments?: number | null
          on_time_repayments?: number | null
          total_amount_borrowed?: number | null
          total_amount_repaid?: number | null
          total_loans_taken?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_credit_scores_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      member_invitations: {
        Row: {
          accepted_at: string | null
          chama_id: string
          created_at: string
          email: string | null
          expires_at: string
          full_name: string | null
          id: string
          invitation_token: string
          invited_by: string
          invited_email: string | null
          invited_phone: string | null
          phone_number: string | null
          role: string | null
          status: string
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          chama_id: string
          created_at?: string
          email?: string | null
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token?: string
          invited_by: string
          invited_email?: string | null
          invited_phone?: string | null
          phone_number?: string | null
          role?: string | null
          status?: string
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          chama_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          full_name?: string | null
          id?: string
          invitation_token?: string
          invited_by?: string
          invited_email?: string | null
          invited_phone?: string | null
          phone_number?: string | null
          role?: string | null
          status?: string
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_invitations_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      member_reputation: {
        Row: {
          chama_id: string | null
          contribution_score: number | null
          created_at: string | null
          id: string
          last_calculated: string | null
          member_id: string | null
          overall_score: number | null
          participation_score: number | null
          repayment_score: number | null
          updated_at: string | null
        }
        Insert: {
          chama_id?: string | null
          contribution_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          member_id?: string | null
          overall_score?: number | null
          participation_score?: number | null
          repayment_score?: number | null
          updated_at?: string | null
        }
        Update: {
          chama_id?: string | null
          contribution_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated?: string | null
          member_id?: string | null
          overall_score?: number | null
          participation_score?: number | null
          repayment_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_reputation_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_reputation_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_reputation_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_wallets: {
        Row: {
          balance: number
          chama_id: string
          created_at: string | null
          id: string
          member_id: string
          updated_at: string | null
        }
        Insert: {
          balance?: number
          chama_id: string
          created_at?: string | null
          id?: string
          member_id: string
          updated_at?: string | null
        }
        Update: {
          balance?: number
          chama_id?: string
          created_at?: string | null
          id?: string
          member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_wallets_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_wallets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_leaderboard"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "member_wallets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chama_members"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_enrollments: {
        Row: {
          completed_at: string | null
          enrolled_at: string | null
          feedback: string | null
          id: string
          mentee_id: string
          program_id: string
          rating: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          enrolled_at?: string | null
          feedback?: string | null
          id?: string
          mentee_id: string
          program_id: string
          rating?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          enrolled_at?: string | null
          feedback?: string | null
          id?: string
          mentee_id?: string
          program_id?: string
          rating?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "mentorship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_programs: {
        Row: {
          created_at: string | null
          current_mentees: number | null
          description: string | null
          duration_weeks: number | null
          expertise_areas: string[]
          id: string
          max_mentees: number | null
          mentor_id: string
          price_per_session: number | null
          rating: number | null
          session_type: string | null
          status: string | null
          title: string
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_mentees?: number | null
          description?: string | null
          duration_weeks?: number | null
          expertise_areas: string[]
          id?: string
          max_mentees?: number | null
          mentor_id: string
          price_per_session?: number | null
          rating?: number | null
          session_type?: string | null
          status?: string | null
          title: string
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_mentees?: number | null
          description?: string | null
          duration_weeks?: number | null
          expertise_areas?: string[]
          id?: string
          max_mentees?: number | null
          mentor_id?: string
          price_per_session?: number | null
          rating?: number | null
          session_type?: string | null
          status?: string | null
          title?: string
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchants: {
        Row: {
          category: string
          contact_info: Json | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      mobile_money_accounts: {
        Row: {
          account_name: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          phone_number: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      money_transfers_v2: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          from_user_id: string
          id: string
          message: string | null
          pin_verified: boolean | null
          status: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_user_id: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          from_user_id: string
          id?: string
          message?: string | null
          pin_verified?: boolean | null
          status?: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_user_id: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          from_user_id?: string
          id?: string
          message?: string | null
          pin_verified?: boolean | null
          status?: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_user_id?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_transfers_v2_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_maintenance_fees: {
        Row: {
          attempts: number
          created_at: string
          deducted_at: string | null
          due_date: string
          fee_amount: number
          id: string
          last_attempt_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          deducted_at?: string | null
          due_date: string
          fee_amount?: number
          id?: string
          last_attempt_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          deducted_at?: string | null
          due_date?: string
          fee_amount?: number
          id?: string
          last_attempt_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          amount: number
          callback_data: Json | null
          chama_id: string | null
          checkout_request_id: string | null
          created_at: string
          id: string
          merchant_request_id: string | null
          metadata: Json | null
          mpesa_receipt_number: string | null
          phone_number: string
          purpose: string | null
          result_code: number | null
          result_desc: string | null
          status: string
          transaction_date: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          callback_data?: Json | null
          chama_id?: string | null
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          phone_number: string
          purpose?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          transaction_date?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          callback_data?: Json | null
          chama_id?: string | null
          checkout_request_id?: string | null
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          phone_number?: string
          purpose?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          transaction_date?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      mpesa_transactions_backup: {
        Row: {
          amount: number | null
          callback_data: Json | null
          chama_id: string | null
          checkout_request_id: string | null
          created_at: string | null
          id: string | null
          merchant_request_id: string | null
          metadata: Json | null
          mpesa_receipt_number: string | null
          phone_number: string | null
          purpose: string | null
          result_code: number | null
          result_desc: string | null
          status: string | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          callback_data?: Json | null
          chama_id?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          id?: string | null
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          purpose?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          callback_data?: Json | null
          chama_id?: string | null
          checkout_request_id?: string | null
          created_at?: string | null
          id?: string | null
          merchant_request_id?: string | null
          metadata?: Json | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          purpose?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          chama_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          loan_reminders: boolean | null
          marketing_emails: boolean | null
          push_notifications: boolean | null
          security_alerts: boolean | null
          sms_notifications: boolean | null
          transaction_alerts: boolean | null
          updated_at: string | null
          user_id: string
          weekly_summaries: boolean | null
        }
        Insert: {
          chama_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          loan_reminders?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          security_alerts?: boolean | null
          sms_notifications?: boolean | null
          transaction_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_summaries?: boolean | null
        }
        Update: {
          chama_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          loan_reminders?: boolean | null
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          security_alerts?: boolean | null
          sms_notifications?: boolean | null
          transaction_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_summaries?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      p2p_chats: {
        Row: {
          created_at: string | null
          escrow_id: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          escrow_id: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          escrow_id?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_chats_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "p2p_escrows"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_escrows: {
        Row: {
          amount: number
          asset: string
          buyer_id: string
          created_at: string | null
          currency: string
          id: string
          listing_id: string
          payment_confirmed: boolean
          released_at: string | null
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          asset: string
          buyer_id: string
          created_at?: string | null
          currency: string
          id?: string
          listing_id: string
          payment_confirmed?: boolean
          released_at?: string | null
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          asset?: string
          buyer_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          listing_id?: string
          payment_confirmed?: boolean
          released_at?: string | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_escrows_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "p2p_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_listings: {
        Row: {
          amount: number
          asset: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          is_active: boolean
          payment_method: string
          price_per_unit: number
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          asset: string
          created_at?: string | null
          currency: string
          description?: string | null
          id?: string
          is_active?: boolean
          payment_method: string
          price_per_unit: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          asset?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          payment_method?: string
          price_per_unit?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      p2p_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          escrow_id: string
          id: string
          ratee_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          escrow_id: string
          id?: string
          ratee_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          escrow_id?: string
          id?: string
          ratee_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "p2p_ratings_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "p2p_escrows"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_verifications: {
        Row: {
          created_at: string | null
          email_verified: boolean
          id: string
          id_document_url: string | null
          phone_verified: boolean
          selfie_url: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_verified?: boolean
          id?: string
          id_document_url?: string | null
          phone_verified?: boolean
          selfie_url?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_verified?: boolean
          id?: string
          id_document_url?: string | null
          phone_verified?: boolean
          selfie_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      package_purchases: {
        Row: {
          amount: number
          commission_amount: number
          created_at: string | null
          hotspot_id: string
          id: string
          idempotency_key: string
          metadata: Json | null
          package_id: string
          payment_method: string
          payment_reference: string | null
          platform_fee: number | null
          seller_amount: number
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          commission_amount: number
          created_at?: string | null
          hotspot_id: string
          id?: string
          idempotency_key: string
          metadata?: Json | null
          package_id: string
          payment_method: string
          payment_reference?: string | null
          platform_fee?: number | null
          seller_amount: number
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          commission_amount?: number
          created_at?: string | null
          hotspot_id?: string
          id?: string
          idempotency_key?: string
          metadata?: Json | null
          package_id?: string
          payment_method?: string
          payment_reference?: string | null
          platform_fee?: number | null
          seller_amount?: number
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_purchases_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "wifi_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "wifi_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_purchases_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "wifi_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean | null
          created_at: string | null
          data_mb: number | null
          duration_minutes: number | null
          hotspot_id: string | null
          id: string
          max_concurrent: number | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          data_mb?: number | null
          duration_minutes?: number | null
          hotspot_id?: string | null
          id?: string
          max_concurrent?: number | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          data_mb?: number | null
          duration_minutes?: number | null
          hotspot_id?: string | null
          id?: string
          max_concurrent?: number | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          borrower_id: string
          created_at: string | null
          id: string
          investor_id: string
          loan_offer_id: string | null
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          requested_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          borrower_id: string
          created_at?: string | null
          id?: string
          investor_id: string
          loan_offer_id?: string | null
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          borrower_id?: string
          created_at?: string | null
          id?: string
          investor_id?: string
          loan_offer_id?: string | null
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_loan_offer_id_fkey"
            columns: ["loan_offer_id"]
            isOneToOne: false
            referencedRelation: "loan_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          fee: number | null
          id: string
          payout_method: string | null
          processed_at: string | null
          reference_number: string | null
          seller_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee?: number | null
          id?: string
          payout_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee?: number | null
          id?: string
          payout_method?: string | null
          processed_at?: string | null
          reference_number?: string | null
          seller_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      paystack_transactions: {
        Row: {
          amount: number
          callback_data: Json | null
          created_at: string
          email: string
          gateway_response: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string
          paystack_reference: string | null
          phone_number: string | null
          reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          callback_data?: Json | null
          created_at?: string
          email: string
          gateway_response?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method: string
          paystack_reference?: string | null
          phone_number?: string | null
          reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          callback_data?: Json | null
          created_at?: string
          email?: string
          gateway_response?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string
          paystack_reference?: string | null
          phone_number?: string | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paystack_webhooks: {
        Row: {
          amount: number | null
          channel: string | null
          created_at: string | null
          customer_email: string | null
          error_message: string | null
          event_type: string
          id: string
          processed_at: string | null
          reference: string
          status: string | null
          webhook_data: Json | null
        }
        Insert: {
          amount?: number | null
          channel?: string | null
          created_at?: string | null
          customer_email?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          reference: string
          status?: string | null
          webhook_data?: Json | null
        }
        Update: {
          amount?: number | null
          channel?: string | null
          created_at?: string | null
          customer_email?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          reference?: string
          status?: string | null
          webhook_data?: Json | null
        }
        Relationships: []
      }
      peer_lending_offers: {
        Row: {
          accepted_at: string | null
          amount: number
          borrower_email: string
          borrower_id: string | null
          created_at: string | null
          disbursed_at: string | null
          duration_months: number
          id: string
          interest_rate: number
          lender_id: string
          offer_message: string | null
          purpose: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          borrower_email: string
          borrower_id?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          lender_id: string
          offer_message?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          borrower_email?: string
          borrower_id?: string | null
          created_at?: string | null
          disbursed_at?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number
          lender_id?: string
          offer_message?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      peer_lending_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          offer_id: string
          payment_method: string | null
          status: string
          transaction_reference: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          offer_id: string
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          offer_id?: string
          payment_method?: string | null
          status?: string
          transaction_reference?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_lending_transactions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "peer_lending_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_chama_purchases: {
        Row: {
          amount_paid: number | null
          buyer_user_id: string
          chama_id: string
          created_at: string
          expected_amount: number
          expires_at: string
          id: string
          metadata: Json | null
          ownership_granted: boolean | null
          payment_status: string
          payment_verified_at: string | null
          paystack_reference: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          buyer_user_id: string
          chama_id: string
          created_at?: string
          expected_amount: number
          expires_at?: string
          id?: string
          metadata?: Json | null
          ownership_granted?: boolean | null
          payment_status?: string
          payment_verified_at?: string | null
          paystack_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          buyer_user_id?: string
          chama_id?: string
          created_at?: string
          expected_amount?: number
          expires_at?: string
          id?: string
          metadata?: Json | null
          ownership_granted?: boolean | null
          payment_status?: string
          payment_verified_at?: string | null
          paystack_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_chama_purchases_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_savings_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          goal_name: string
          id: string
          status: string | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          goal_name: string
          id?: string
          status?: string | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          goal_name?: string
          id?: string
          status?: string | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_savings_transactions: {
        Row: {
          amount: number
          created_at: string | null
          frequency: string | null
          id: string
          notes: string | null
          payment_method: string | null
          savings_goal_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          savings_goal_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          savings_goal_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_savings_transactions_savings_goal_id_fkey"
            columns: ["savings_goal_id"]
            isOneToOne: false
            referencedRelation: "personal_savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      pesapal_transactions: {
        Row: {
          amount: number
          callback_data: Json | null
          confirmation_code: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          id: string
          merchant_reference: string
          order_tracking_id: string | null
          payment_account: string | null
          payment_method: string | null
          payment_status_description: string | null
          phone_number: string | null
          status: string | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          callback_data?: Json | null
          confirmation_code?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          merchant_reference: string
          order_tracking_id?: string | null
          payment_account?: string | null
          payment_method?: string | null
          payment_status_description?: string | null
          phone_number?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          callback_data?: Json | null
          confirmation_code?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          id?: string
          merchant_reference?: string
          order_tracking_id?: string | null
          payment_account?: string | null
          payment_method?: string | null
          payment_status_description?: string | null
          phone_number?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_accounts: {
        Row: {
          account_type: string
          balance: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          is_active: boolean | null
          total_collected: number
          updated_at: string | null
        }
        Insert: {
          account_type: string
          balance?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          total_collected?: number
          updated_at?: string | null
        }
        Update: {
          account_type?: string
          balance?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          total_collected?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_access_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown
          portal_user_id: string | null
          resource: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          portal_user_id?: string | null
          resource?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          portal_user_id?: string | null
          resource?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_access_logs_portal_user_id_fkey"
            columns: ["portal_user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_credentials: {
        Row: {
          access_level: string
          created_at: string
          created_by: string | null
          credential_code: string
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          organization: string | null
          updated_at: string
        }
        Insert: {
          access_level: string
          created_at?: string
          created_by?: string | null
          credential_code: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          created_by?: string | null
          credential_code?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_credentials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          portal_user_id: string
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown
          portal_user_id: string
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          portal_user_id?: string
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_sessions_portal_user_id_fkey"
            columns: ["portal_user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_users: {
        Row: {
          access_level: string
          code_expires_at: string | null
          created_at: string
          department: string | null
          email: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          locked_until: string | null
          login_attempts: number | null
          login_code: string | null
          organization: string | null
          password_hash: string | null
          password_salt: string | null
          password_set_at: string | null
          phone_number: string | null
          requires_password_setup: boolean | null
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          access_level?: string
          code_expires_at?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          login_code?: string | null
          organization?: string | null
          password_hash?: string | null
          password_salt?: string | null
          password_set_at?: string | null
          phone_number?: string | null
          requires_password_setup?: boolean | null
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          access_level?: string
          code_expires_at?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          login_code?: string | null
          organization?: string | null
          password_hash?: string | null
          password_salt?: string | null
          password_set_at?: string | null
          phone_number?: string | null
          requires_password_setup?: boolean | null
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      prediction_bets: {
        Row: {
          actual_payout: number | null
          bet_amount: number
          id: string
          placed_at: string | null
          potential_payout: number | null
          predicted_option: Json
          prediction_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          actual_payout?: number | null
          bet_amount: number
          id?: string
          placed_at?: string | null
          potential_payout?: number | null
          predicted_option: Json
          prediction_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          actual_payout?: number | null
          bet_amount?: number
          id?: string
          placed_at?: string | null
          potential_payout?: number | null
          predicted_option?: Json
          prediction_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_bets_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "prediction_games"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_games: {
        Row: {
          category: string
          correct_answer: Json | null
          created_at: string | null
          deadline: string
          description: string | null
          house_edge: number | null
          id: string
          maximum_bet: number | null
          minimum_bet: number | null
          options: Json
          prediction_type: string
          resolution_time: string | null
          resolved_at: string | null
          source_url: string | null
          status: string | null
          title: string
          total_pool: number | null
        }
        Insert: {
          category: string
          correct_answer?: Json | null
          created_at?: string | null
          deadline: string
          description?: string | null
          house_edge?: number | null
          id?: string
          maximum_bet?: number | null
          minimum_bet?: number | null
          options: Json
          prediction_type: string
          resolution_time?: string | null
          resolved_at?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          total_pool?: number | null
        }
        Update: {
          category?: string
          correct_answer?: Json | null
          created_at?: string | null
          deadline?: string
          description?: string | null
          house_edge?: number | null
          id?: string
          maximum_bet?: number | null
          minimum_bet?: number | null
          options?: Json
          prediction_type?: string
          resolution_time?: string | null
          resolved_at?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          total_pool?: number | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle: string | null
          chama_id: string | null
          created_at: string | null
          expires_at: string | null
          features: Json
          id: string
          monthly_fee: number
          status: string | null
          subscription_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          chama_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          features?: Json
          id?: string
          monthly_fee: number
          status?: string | null
          subscription_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle?: string | null
          chama_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          features?: Json
          id?: string
          monthly_fee?: number
          status?: string | null
          subscription_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          central_wallet_balance: number | null
          country: string | null
          created_at: string
          credit_score: number | null
          email: string | null
          full_name: string | null
          id: string
          loan_eligibility: number | null
          phone: string | null
          phone_number: string | null
          preferred_language: string | null
          region: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          central_wallet_balance?: number | null
          country?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          loan_eligibility?: number | null
          phone?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          central_wallet_balance?: number | null
          country?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          loan_eligibility?: number | null
          phone?: string | null
          phone_number?: string | null
          preferred_language?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      project_updates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          project_id: string | null
          title: string
          update_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          project_id?: string | null
          title: string
          update_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          project_id?: string | null
          title?: string
          update_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "investment_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saving_group_members: {
        Row: {
          group_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          last_contribution_date: string | null
          role: string | null
          total_contributed: number | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          last_contribution_date?: string | null
          role?: string | null
          total_contributed?: number | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          last_contribution_date?: string | null
          role?: string | null
          total_contributed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saving_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "saving_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      saving_groups: {
        Row: {
          contribution_frequency: string | null
          created_at: string
          created_by: string
          current_members: number | null
          description: string | null
          group_type: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          min_contribution: number | null
          name: string
          target_amount: number | null
          total_saved: number | null
          updated_at: string
        }
        Insert: {
          contribution_frequency?: string | null
          created_at?: string
          created_by: string
          current_members?: number | null
          description?: string | null
          group_type?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          min_contribution?: number | null
          name: string
          target_amount?: number | null
          total_saved?: number | null
          updated_at?: string
        }
        Update: {
          contribution_frequency?: string | null
          created_at?: string
          created_by?: string
          current_members?: number | null
          description?: string | null
          group_type?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          min_contribution?: number | null
          name?: string
          target_amount?: number | null
          total_saved?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      savings_accounts_v2: {
        Row: {
          account_name: string
          auto_save_amount: number | null
          auto_save_frequency: string | null
          created_at: string | null
          current_amount: number | null
          id: string
          is_active: boolean | null
          target_amount: number | null
          target_date: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          account_name: string
          auto_save_amount?: number | null
          auto_save_frequency?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_active?: boolean | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          account_name?: string
          auto_save_amount?: number | null
          auto_save_frequency?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          is_active?: boolean | null
          target_amount?: number | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_accounts_v2_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          goal_name: string | null
          id: number
          phone: string | null
          target_amount: number | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          goal_name?: string | null
          id?: number
          phone?: string | null
          target_amount?: number | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          goal_name?: string | null
          id?: number
          phone?: string | null
          target_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_phone_fkey"
            columns: ["phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone"]
          },
        ]
      }
      seller_wallets: {
        Row: {
          balance: number | null
          seller_id: string
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          seller_id: string
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          seller_id?: string
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_wallets_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          bank_details: Json | null
          business_name: string | null
          commission_rate: number | null
          created_at: string | null
          id: string
          kyc_docs: Json | null
          kyc_status: string | null
          mpesa_number: string | null
          phone: string | null
          portal_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          bank_details?: Json | null
          business_name?: string | null
          commission_rate?: number | null
          created_at?: string | null
          id: string
          kyc_docs?: Json | null
          kyc_status?: string | null
          mpesa_number?: string | null
          phone?: string | null
          portal_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_details?: Json | null
          business_name?: string | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          kyc_docs?: Json | null
          kyc_status?: string | null
          mpesa_number?: string | null
          phone?: string | null
          portal_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_portal_user_id_fkey"
            columns: ["portal_user_id"]
            isOneToOne: false
            referencedRelation: "portal_users"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_contributions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          message: string | null
          payment_method: string | null
          sponsor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          sponsor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          sponsor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_contributions_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "wallet_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      spotlight_stories: {
        Row: {
          author_id: string
          chama_id: string | null
          content_type: string | null
          content_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          featured: boolean | null
          id: string
          likes: number | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id: string
          chama_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured?: boolean | null
          id?: string
          likes?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string
          chama_id?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          featured?: boolean | null
          id?: string
          likes?: number | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      staking_pools: {
        Row: {
          apy: number
          created_at: string
          currency: string
          id: string
          is_active: boolean | null
          max_stake: number | null
          min_stake: number
          name: string
          total_staked: number | null
          updated_at: string
        }
        Insert: {
          apy: number
          created_at?: string
          currency: string
          id?: string
          is_active?: boolean | null
          max_stake?: number | null
          min_stake: number
          name: string
          total_staked?: number | null
          updated_at?: string
        }
        Update: {
          apy?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          max_stake?: number | null
          min_stake?: number
          name?: string
          total_staked?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      student_wallets: {
        Row: {
          balance: number | null
          class_level: string | null
          created_at: string | null
          id: string
          parent_id: string
          school_name: string | null
          student_name: string
          target_amount: number | null
          target_deadline: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          class_level?: string | null
          created_at?: string | null
          id?: string
          parent_id: string
          school_name?: string | null
          student_name: string
          target_amount?: number | null
          target_deadline?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          class_level?: string | null
          created_at?: string | null
          id?: string
          parent_id?: string
          school_name?: string | null
          student_name?: string
          target_amount?: number | null
          target_deadline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          current_score: number | null
          eliminated_at: string | null
          entry_fee_paid: number | null
          id: string
          prize_amount: number | null
          ranking: number | null
          registration_time: string | null
          status: string | null
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          current_score?: number | null
          eliminated_at?: string | null
          entry_fee_paid?: number | null
          id?: string
          prize_amount?: number | null
          ranking?: number | null
          registration_time?: string | null
          status?: string | null
          tournament_id?: string | null
          user_id: string
        }
        Update: {
          current_score?: number | null
          eliminated_at?: string | null
          entry_fee_paid?: number | null
          id?: string
          prize_amount?: number | null
          ranking?: number | null
          registration_time?: string | null
          status?: string | null
          tournament_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "game_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_fees: {
        Row: {
          amount: number
          created_at: string | null
          fee_amount: number
          fee_configuration_id: string | null
          id: string
          transaction_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          fee_amount: number
          fee_configuration_id?: string | null
          id?: string
          transaction_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          fee_amount?: number
          fee_configuration_id?: string | null
          id?: string
          transaction_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_fees_fee_configuration_id_fkey"
            columns: ["fee_configuration_id"]
            isOneToOne: false
            referencedRelation: "fee_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_ledger: {
        Row: {
          account_id: string | null
          account_type: string
          balance_after: number
          created_at: string | null
          credit_amount: number | null
          currency: string | null
          debit_amount: number | null
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          transaction_id: string
          transaction_type: string
        }
        Insert: {
          account_id?: string | null
          account_type: string
          balance_after: number
          created_at?: string | null
          credit_amount?: number | null
          currency?: string | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          transaction_id: string
          transaction_type: string
        }
        Update: {
          account_id?: string | null
          account_type?: string
          balance_after?: number
          created_at?: string | null
          credit_amount?: number | null
          currency?: string | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          transaction_id?: string
          transaction_type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: number
          phone: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: number
          phone?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: number
          phone?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_phone_fkey"
            columns: ["phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone"]
          },
        ]
      }
      tuition_payments: {
        Row: {
          academic_year: string | null
          amount: number
          created_at: string | null
          id: string
          payment_type: string
          receipt_number: string | null
          school_paybill: string | null
          status: string | null
          term: string | null
          wallet_id: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_type: string
          receipt_number?: string | null
          school_paybill?: string | null
          status?: string | null
          term?: string | null
          wallet_id?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_type?: string
          receipt_number?: string | null
          school_paybill?: string | null
          status?: string | null
          term?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tuition_payments_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "student_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_title: string
          icon: string | null
          id: string
          points_awarded: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_title: string
          icon?: string | null
          id?: string
          points_awarded?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_title?: string
          icon?: string | null
          id?: string
          points_awarded?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_bill_payments: {
        Row: {
          account_number: string
          amount: number
          bill_provider_id: string
          created_at: string
          id: string
          reference_number: string | null
          service_fee: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          bill_provider_id: string
          created_at?: string
          id?: string
          reference_number?: string | null
          service_fee?: number
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          bill_provider_id?: string
          created_at?: string
          id?: string
          reference_number?: string | null
          service_fee?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_bill_payments_provider"
            columns: ["bill_provider_id"]
            isOneToOne: false
            referencedRelation: "bill_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bill_providers: {
        Row: {
          account_number: string | null
          category: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          paybill_number: string | null
          provider_code: string | null
          provider_name: string
          provider_type: string
          till_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          paybill_number?: string | null
          provider_code?: string | null
          provider_name: string
          provider_type: string
          till_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          paybill_number?: string | null
          provider_code?: string | null
          provider_name?: string
          provider_type?: string
          till_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_budgets: {
        Row: {
          created_at: string
          id: string
          month: string
          total_budget: number
          total_income: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          total_budget?: number
          total_income?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          total_budget?: number
          total_income?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_central_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          answers: Json | null
          challenge_id: string | null
          completed_at: string | null
          id: string
          points_earned: number | null
          reward_earned: number | null
          score: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          reward_earned?: number | null
          score: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          challenge_id?: string | null
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          reward_earned?: number | null
          score?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "learning_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deal_usage: {
        Row: {
          deal_id: string
          discount_amount: number
          final_amount: number
          id: string
          merchant_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          deal_id: string
          discount_amount: number
          final_amount: number
          id?: string
          merchant_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          deal_id?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          merchant_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_deal_usage_deal"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_deal_usage_merchant"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_financial_profiles: {
        Row: {
          ai_insights_enabled: boolean | null
          created_at: string | null
          current_savings: number | null
          financial_goals: Json | null
          id: string
          monthly_expenses: number | null
          monthly_income: number | null
          risk_tolerance: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_insights_enabled?: boolean | null
          created_at?: string | null
          current_savings?: number | null
          financial_goals?: Json | null
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_insights_enabled?: boolean | null
          created_at?: string | null
          current_savings?: number | null
          financial_goals?: Json | null
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          risk_tolerance?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          amount_invested: number
          created_at: string | null
          exit_date: string | null
          id: string
          investor_id: string
          last_return_date: string | null
          project_id: string | null
          returns_earned: number | null
          shares_percentage: number
          status: string | null
        }
        Insert: {
          amount_invested: number
          created_at?: string | null
          exit_date?: string | null
          id?: string
          investor_id: string
          last_return_date?: string | null
          project_id?: string | null
          returns_earned?: number | null
          shares_percentage: number
          status?: string | null
        }
        Update: {
          amount_invested?: number
          created_at?: string | null
          exit_date?: string | null
          id?: string
          investor_id?: string
          last_return_date?: string | null
          project_id?: string | null
          returns_earned?: number | null
          shares_percentage?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "investment_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kyc: {
        Row: {
          created_at: string | null
          document_url: string | null
          email_verified: boolean | null
          id: string
          id_number: string | null
          phone_verified: boolean | null
          selfie_url: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          email_verified?: boolean | null
          id?: string
          id_number?: string | null
          phone_verified?: boolean | null
          selfie_url?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          email_verified?: boolean | null
          id?: string
          id_number?: string | null
          phone_verified?: boolean | null
          selfie_url?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          content_id: string | null
          created_at: string
          id: string
          score: number | null
          status: string
          time_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          time_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          score?: number | null
          status?: string
          time_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pins: {
        Row: {
          created_at: string | null
          id: string
          pin_hash: string
          salt: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pin_hash: string
          salt: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pin_hash?: string
          salt?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_pins_enhanced: {
        Row: {
          created_at: string | null
          failed_attempts: number | null
          id: string
          last_verified: string | null
          locked_until: string | null
          pin_hash: string
          salt: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_verified?: string | null
          locked_until?: string | null
          pin_hash: string
          salt: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_verified?: string | null
          locked_until?: string | null
          pin_hash?: string
          salt?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profile_photos: {
        Row: {
          created_at: string | null
          id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          experience_years: number | null
          id: string
          location: string | null
          profession: string | null
          profile_type: string
          success_rate: number | null
          total_borrowed: number | null
          total_funded: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          profession?: string | null
          profile_type: string
          success_rate?: number | null
          total_borrowed?: number | null
          total_funded?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          id?: string
          location?: string | null
          profession?: string | null
          profile_type?: string
          success_rate?: number | null
          total_borrowed?: number | null
          total_funded?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      user_profiles_enhanced: {
        Row: {
          business_name: string | null
          business_permit_ref: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          institution_name: string | null
          kyc_rejected_at: string | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          location: string | null
          phone: string | null
          rejection_reason: string | null
          updated_at: string | null
          user_category: string | null
          user_id: string
          verification_tier: number | null
        }
        Insert: {
          business_name?: string | null
          business_permit_ref?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution_name?: string | null
          kyc_rejected_at?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          phone?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_category?: string | null
          user_id: string
          verification_tier?: number | null
        }
        Update: {
          business_name?: string | null
          business_permit_ref?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          institution_name?: string | null
          kyc_rejected_at?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          phone?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
          user_category?: string | null
          user_id?: string
          verification_tier?: number | null
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          bonus_earned: number | null
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string | null
        }
        Insert: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string | null
        }
        Update: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_security_settings: {
        Row: {
          account_locked_until: string | null
          auto_logout_minutes: number | null
          biometric_enabled: boolean | null
          created_at: string | null
          failed_pin_attempts: number | null
          id: string
          last_password_change: string | null
          security_questions: Json | null
          trusted_devices: Json | null
          two_factor_enabled: boolean | null
          two_factor_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          auto_logout_minutes?: number | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          failed_pin_attempts?: number | null
          id?: string
          last_password_change?: string | null
          security_questions?: Json | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          auto_logout_minutes?: number | null
          biometric_enabled?: boolean | null
          created_at?: string | null
          failed_pin_attempts?: number | null
          id?: string
          last_password_change?: string | null
          security_questions?: Json | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          location_data: Json | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stakes: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_active: boolean | null
          last_reward_date: string | null
          pool_id: string
          rewards_earned: number | null
          stake_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_reward_date?: string | null
          pool_id: string
          rewards_earned?: number | null
          stake_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_reward_date?: string | null
          pool_id?: string
          rewards_earned?: number | null
          stake_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "staking_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          started_at: string
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          started_at?: string
          status?: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string
          currency: string | null
          id: string
          is_connected: boolean | null
          locked_collateral: number | null
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_connected?: boolean | null
          locked_collateral?: number | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_connected?: boolean | null
          locked_collateral?: number | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_wallets_v2: {
        Row: {
          balance: number | null
          chama_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          locked_balance: number | null
          updated_at: string | null
          user_id: string | null
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          withdrawal_locked: boolean | null
        }
        Insert: {
          balance?: number | null
          chama_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          locked_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          withdrawal_locked?: boolean | null
        }
        Update: {
          balance?: number | null
          chama_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          locked_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
          withdrawal_locked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_v2_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: number
          name: string | null
          phone: string | null
        }
        Insert: {
          id?: number
          name?: string | null
          phone?: string | null
        }
        Update: {
          id?: number
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      vote_responses: {
        Row: {
          created_at: string | null
          id: string
          response: boolean
          vote_id: string | null
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          response: boolean
          vote_id?: string | null
          voter_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          response?: boolean
          vote_id?: string | null
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_responses_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "chama_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_balance_snapshots: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          snapshot_date: string
          snapshot_time: string
          transaction_count: number | null
          wallet_id: string
          wallet_type: string
        }
        Insert: {
          balance: number
          created_at?: string | null
          id?: string
          snapshot_date?: string
          snapshot_time?: string
          transaction_count?: number | null
          wallet_id: string
          wallet_type: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          snapshot_date?: string
          snapshot_time?: string
          transaction_count?: number | null
          wallet_id?: string
          wallet_type?: string
        }
        Relationships: []
      }
      wallet_currencies: {
        Row: {
          balance: number
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          locked_balance: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency_code: string
          id?: string
          is_active?: boolean
          locked_balance?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          locked_balance?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      wallet_sponsors: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          relationship: string | null
          sponsor_email: string | null
          sponsor_name: string
          sponsor_phone: string | null
          total_contributed: number | null
          wallet_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          relationship?: string | null
          sponsor_email?: string | null
          sponsor_name: string
          sponsor_phone?: string | null
          total_contributed?: number | null
          wallet_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          relationship?: string | null
          sponsor_email?: string | null
          sponsor_name?: string
          sponsor_phone?: string | null
          total_contributed?: number | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_sponsors_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "student_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transaction_types: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          type_code: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          type_code: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          type_code?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          completed_at: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          receiver_id: string | null
          reference_number: string | null
          sender_id: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          receiver_id?: string | null
          reference_number?: string | null
          sender_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          receiver_id?: string | null
          reference_number?: string | null
          sender_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_central_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions_v2: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string | null
          currency: string | null
          description: string | null
          external_reference: string | null
          fee_amount: number | null
          from_wallet_id: string | null
          id: string
          metadata: Json | null
          net_amount: number
          processed_at: string | null
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_wallet_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_reference?: string | null
          fee_amount?: number | null
          from_wallet_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          processed_at?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_wallet_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          created_at?: string | null
          currency?: string | null
          description?: string | null
          external_reference?: string | null
          fee_amount?: number | null
          from_wallet_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          processed_at?: string | null
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status_v2"] | null
          to_wallet_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_v2_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_v2_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          id: number
          phone: string | null
        }
        Insert: {
          balance?: number | null
          id?: number
          phone?: string | null
        }
        Update: {
          balance?: number | null
          id?: number
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_phone_fkey"
            columns: ["phone"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["phone"]
          },
        ]
      }
      wifi_hotspots: {
        Row: {
          address: string
          captive_portal_url: string | null
          coverage_radius: number | null
          created_at: string | null
          current_active_users: number | null
          description: string | null
          id: string
          location_lat: number
          location_lng: number
          max_concurrent_users: number | null
          name: string
          network_ssid: string | null
          rating: number | null
          seller_id: string
          setup_type: string | null
          status: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          captive_portal_url?: string | null
          coverage_radius?: number | null
          created_at?: string | null
          current_active_users?: number | null
          description?: string | null
          id?: string
          location_lat: number
          location_lng: number
          max_concurrent_users?: number | null
          name: string
          network_ssid?: string | null
          rating?: number | null
          seller_id: string
          setup_type?: string | null
          status?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          captive_portal_url?: string | null
          coverage_radius?: number | null
          created_at?: string | null
          current_active_users?: number | null
          description?: string | null
          id?: string
          location_lat?: number
          location_lng?: number
          max_concurrent_users?: number | null
          name?: string
          network_ssid?: string | null
          rating?: number | null
          seller_id?: string
          setup_type?: string | null
          status?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wifi_issue_reports: {
        Row: {
          created_at: string | null
          description: string
          hotspot_id: string | null
          id: string
          issue_type: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          hotspot_id?: string | null
          id?: string
          issue_type: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          hotspot_id?: string | null
          id?: string
          issue_type?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wifi_issue_reports_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "wifi_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_issue_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "wifi_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_packages: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          data_limit_mb: number | null
          description: string | null
          duration_minutes: number
          hotspot_id: string
          id: string
          is_active: boolean | null
          is_stackable: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          data_limit_mb?: number | null
          description?: string | null
          duration_minutes: number
          hotspot_id: string
          id?: string
          is_active?: boolean | null
          is_stackable?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          data_limit_mb?: number | null
          description?: string | null
          duration_minutes?: number
          hotspot_id?: string
          id?: string
          is_active?: boolean | null
          is_stackable?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_packages_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "wifi_hotspots"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_sessions: {
        Row: {
          amount_paid: number
          can_extend: boolean | null
          commission_amount: number
          created_at: string | null
          data_limit_mb: number | null
          data_used_mb: number | null
          device_ip: unknown
          device_mac: string | null
          end_time: string
          hotspot_id: string
          id: string
          package_id: string
          qr_code_data: string | null
          seller_amount: number
          session_token: string
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          voucher_code: string | null
        }
        Insert: {
          amount_paid: number
          can_extend?: boolean | null
          commission_amount: number
          created_at?: string | null
          data_limit_mb?: number | null
          data_used_mb?: number | null
          device_ip?: unknown
          device_mac?: string | null
          end_time: string
          hotspot_id: string
          id?: string
          package_id: string
          qr_code_data?: string | null
          seller_amount: number
          session_token: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          voucher_code?: string | null
        }
        Update: {
          amount_paid?: number
          can_extend?: boolean | null
          commission_amount?: number
          created_at?: string | null
          data_limit_mb?: number | null
          data_used_mb?: number | null
          device_ip?: unknown
          device_mac?: string | null
          end_time?: string
          hotspot_id?: string
          id?: string
          package_id?: string
          qr_code_data?: string | null
          seller_amount?: number
          session_token?: string
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_sessions_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "wifi_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_sessions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "wifi_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_transactions: {
        Row: {
          amount: number
          buyer_id: string | null
          commission: number
          created_at: string | null
          hotspot_id: string | null
          id: string
          meta: Json | null
          net_amount: number
          package_id: string | null
          seller_id: string | null
          status: string | null
          voucher_code: string | null
        }
        Insert: {
          amount: number
          buyer_id?: string | null
          commission: number
          created_at?: string | null
          hotspot_id?: string | null
          id?: string
          meta?: Json | null
          net_amount: number
          package_id?: string | null
          seller_id?: string | null
          status?: string | null
          voucher_code?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string | null
          commission?: number
          created_at?: string | null
          hotspot_id?: string | null
          id?: string
          meta?: Json | null
          net_amount?: number
          package_id?: string | null
          seller_id?: string | null
          status?: string | null
          voucher_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wifi_transactions_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wifi_transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      wifi_wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          reference_id: string | null
          status: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          reference_id?: string | null
          status?: string | null
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wifi_wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "buyer_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          currency: string | null
          destination_details: Json
          fee_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          paystack_reference: string | null
          processed_at: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
          withdrawal_method: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          destination_details: Json
          fee_amount?: number
          id?: string
          metadata?: Json | null
          net_amount: number
          paystack_reference?: string | null
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
          withdrawal_method: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          currency?: string | null
          destination_details?: Json
          fee_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          paystack_reference?: string | null
          processed_at?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
          withdrawal_method?: string
        }
        Relationships: []
      }
    }
    Views: {
      chama_leaderboard: {
        Row: {
          chama_id: string | null
          contribution_count: number | null
          joined_at: string | null
          last_contribution_date: string | null
          member_email: string | null
          member_id: string | null
          rank: number | null
          role: string | null
          total_contributed: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chama_members_chama_id_fkey"
            columns: ["chama_id"]
            isOneToOne: false
            referencedRelation: "chamas"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_revenue_summary: {
        Row: {
          account_type: string | null
          current_balance: number | null
          last_updated: string | null
          total_collected: number | null
          total_fees_collected: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_chama_invitation: {
        Args: { invitation_token: string }
        Returns: Json
      }
      add_funds_to_wallet: {
        Args: {
          p_amount: number
          p_currency: string
          p_reference?: string
          p_source?: string
          p_user_id: string
        }
        Returns: string
      }
      add_personal_savings: {
        Args: {
          p_amount: number
          p_frequency?: string
          p_goal_name?: string
          p_notes?: string
        }
        Returns: string
      }
      admin_update_loan_status: {
        Args: {
          p_loan_id: string
          p_rejection_reason?: string
          p_status: string
        }
        Returns: Json
      }
      approve_chama_member: {
        Args: { member_id_to_approve: string }
        Returns: undefined
      }
      approve_join_request: { Args: { p_invitation_id: string }; Returns: Json }
      are_funds_locked: { Args: { p_chama_id: string }; Returns: boolean }
      assess_fraud_risk: {
        Args: {
          p_amount?: number
          p_event_type: string
          p_location?: Json
          p_user_id: string
        }
        Returns: number
      }
      assign_admin_role: { Args: { target_user_id: string }; Returns: Json }
      assign_role_with_credential: {
        Args: {
          p_chama_id: string
          p_credential_type: string
          p_credential_value: string
        }
        Returns: Json
      }
      atomic_wallet_transfer: {
        Args: {
          p_amount: number
          p_description?: string
          p_fee: number
          p_receiver_id: string
          p_sender_id: string
        }
        Returns: Json
      }
      authenticate_portal_user: {
        Args: { p_credential_code: string; p_username: string }
        Returns: Json
      }
      authenticate_portal_user_by_email: {
        Args: { p_credential_code: string; p_email: string }
        Returns: Json
      }
      authenticate_portal_user_password: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      authenticate_seller_with_code: {
        Args: { p_code: string; p_username: string }
        Returns: Json
      }
      authenticate_seller_with_password: {
        Args: { p_password: string; p_username: string }
        Returns: Json
      }
      auto_approve_loan: { Args: { application_id: string }; Returns: boolean }
      calculate_credit_score: {
        Args: { user_id_param: string }
        Returns: number
      }
      calculate_loan_eligibility: {
        Args: { requested_amount: number; user_id_param: string }
        Returns: number
      }
      calculate_loan_schedule: {
        Args: {
          duration_months: number
          interest_rate: number
          principal: number
          start_date: string
        }
        Returns: Json
      }
      calculate_member_credit_score: {
        Args: { p_chama_id: string; p_user_id: string }
        Returns: number
      }
      calculate_member_reputation: {
        Args: { member_chama_id: string; member_user_id: string }
        Returns: undefined
      }
      calculate_risk_rating: {
        Args: {
          employment_months: number
          has_collateral?: boolean
          income: number
          loan_amount: number
        }
        Returns: string
      }
      calculate_savings_interest: {
        Args: { account_id: string }
        Returns: number
      }
      calculate_savings_interest_batch: { Args: never; Returns: undefined }
      calculate_transaction_fee: {
        Args: { p_amount: number; p_transaction_type: string }
        Returns: number
      }
      collect_platform_fee: {
        Args: {
          p_amount: number
          p_fee_type: string
          p_payment_reference?: string
          p_source_transaction_id?: string
          p_user_id: string
        }
        Returns: string
      }
      convert_currency: {
        Args: {
          p_amount: number
          p_from_currency: string
          p_to_currency: string
          p_user_id: string
        }
        Returns: string
      }
      create_chama_invitation: {
        Args: {
          p_chama_id: string
          p_email?: string
          p_phone_number?: string
          p_role?: string
        }
        Returns: string
      }
      create_daily_wallet_snapshots: { Args: never; Returns: number }
      create_member_credential: {
        Args: {
          p_chama_id: string
          p_credential_type: string
          p_credential_value: string
        }
        Returns: Json
      }
      create_p2p_trade: { Args: { p_listing_id: string }; Returns: string }
      create_peer_lending_offer: {
        Args: {
          p_amount: number
          p_borrower_email: string
          p_duration_months: number
          p_interest_rate: number
          p_offer_message: string
          p_purpose: string
        }
        Returns: string
      }
      create_portal_credential: {
        Args: {
          p_access_level: string
          p_expires_hours?: number
          p_max_uses?: number
          p_organization?: string
        }
        Returns: Json
      }
      delete_chama: { Args: { p_chama_id: string }; Returns: Json }
      deposit_to_savings_account: {
        Args: {
          p_account_id: string
          p_amount: number
          p_payment_method?: string
          p_reference?: string
        }
        Returns: Json
      }
      disburse_loan: { Args: { application_id: string }; Returns: Json }
      disburse_peer_loan: {
        Args: { p_offer_id: string; p_user_pin: string }
        Returns: Json
      }
      expire_old_pending_purchases: { Args: never; Returns: undefined }
      find_user_by_email: { Args: { p_email: string }; Returns: string }
      generate_monthly_maintenance_fees: { Args: never; Returns: number }
      generate_referral_code: { Args: never; Returns: string }
      generate_repayment_schedule: {
        Args: { application_id: string }
        Returns: undefined
      }
      generate_seller_login_code: {
        Args: { p_username: string }
        Returns: Json
      }
      generate_voucher_code: { Args: never; Returns: string }
      get_admin_analytics: {
        Args: { p_chama_id: string }
        Returns: {
          active_loans: number
          active_members: number
          average_contribution: number
          contribution_rate: number
          monthly_contributions: number
          pending_members: number
          total_contributions: number
          total_loans: number
          total_members: number
        }[]
      }
      get_admin_loan_statistics: {
        Args: never
        Returns: {
          active_loans: number
          avg_repayment_rate: number
          completed_loans: number
          overdue_loans: number
          pending_loans: number
          risk_distribution: Json
          total_loans: number
          total_volume: number
        }[]
      }
      get_admin_loans_overview: {
        Args: never
        Returns: {
          approved_at: string
          borrower_email: string
          borrower_name: string
          borrower_region: string
          chama_name: string
          created_at: string
          credit_score: number
          days_overdue: number
          disbursed_amount: number
          due_date: string
          employment_status: string
          funded_at: string
          funding_progress: number
          id: string
          interest_rate: number
          loan_amount: number
          loan_purpose: string
          loan_term_months: number
          monthly_income: number
          remaining_amount: number
          repaid_amount: number
          repayment_rate: number
          risk_rating: string
          status: string
        }[]
      }
      get_chama_contribution_summary: {
        Args: { p_chama_id: string }
        Returns: {
          contribution_count: number
          last_contribution_date: string
          member_email: string
          member_id: string
          total_contributed: number
        }[]
      }
      get_chama_leaderboard: {
        Args: { p_chama_id: string }
        Returns: {
          contribution_count: number
          joined_at: string
          last_contribution_date: string
          member_email: string
          member_id: string
          rank: number
          role: string
          total_contributed: number
        }[]
      }
      get_exchange_rate: {
        Args: { from_curr: string; to_curr: string }
        Returns: number
      }
      get_lender_average_rating: {
        Args: { lender_user_id: string }
        Returns: number
      }
      get_p2p_listings_with_profiles: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["p2p_listing_with_profile"][]
        SetofOptions: {
          from: "*"
          to: "p2p_listing_with_profile"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_pending_chama_members: {
        Args: { p_chama_id: string }
        Returns: {
          email: string
          id: string
          joined_at: string
          user_id: string
        }[]
      }
      get_pending_contributions: {
        Args: { p_chama_id: string }
        Returns: {
          days_overdue: number
          expected_amount: number
          last_contribution_date: string
          member_email: string
          member_id: string
        }[]
      }
      get_seller_by_portal_user: {
        Args: { p_portal_user_id: string }
        Returns: {
          bank_details: Json | null
          business_name: string | null
          commission_rate: number | null
          created_at: string | null
          id: string
          kyc_docs: Json | null
          kyc_status: string | null
          mpesa_number: string | null
          phone: string | null
          portal_user_id: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "sellers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_pin_setup: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: { role_param: string; user_id_param: string }
        Returns: boolean
      }
      increment_wallet_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      initiate_mpesa_payment: {
        Args: {
          p_account_reference?: string
          p_amount: number
          p_phone_number: string
          p_transaction_desc?: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      is_chama_admin: { Args: { chama_id_to_check: string }; Returns: boolean }
      is_chama_admin_or_treasurer: {
        Args: { chama_id_to_check: string }
        Returns: boolean
      }
      is_chama_member: { Args: { chama_id_to_check: string }; Returns: boolean }
      is_paid_chama_member: { Args: { p_chama_id: string }; Returns: boolean }
      is_transaction_unique: { Args: { p_reference: string }; Returns: boolean }
      make_chama_contribution: {
        Args: {
          p_amount: number
          p_chama_id: string
          p_notes?: string
          p_payment_method?: string
          p_payment_reference?: string
        }
        Returns: string
      }
      mark_payment_failed: {
        Args: { p_failure_reason: string; p_payment_reference: string }
        Returns: Json
      }
      process_loan_repayment: {
        Args: {
          payment_amount: number
          payment_method?: string
          payment_reference?: string
          repayment_id: string
        }
        Returns: Json
      }
      process_monthly_maintenance_fees: { Args: never; Returns: number }
      process_mpesa_callback: {
        Args: {
          p_callback_data?: Json
          p_mpesa_receipt_number?: string
          p_result_code: number
          p_result_desc: string
          p_transaction_id: string
        }
        Returns: Json
      }
      process_payment: {
        Args: {
          p_amount: number
          p_chama_id: string
          p_description?: string
          p_payment_method?: string
          p_payment_reference?: string
        }
        Returns: string
      }
      process_user_withdrawal: {
        Args: { p_withdrawal_request_id: string }
        Returns: Json
      }
      record_ledger_entry: {
        Args: {
          p_amount: number
          p_credit_account_id: string
          p_credit_account_type: string
          p_currency?: string
          p_debit_account_id: string
          p_debit_account_type: string
          p_description?: string
          p_metadata?: Json
          p_transaction_id: string
          p_transaction_type: string
        }
        Returns: undefined
      }
      record_manual_deposit: {
        Args: {
          p_amount: number
          p_chama_id: string
          p_description?: string
          p_payment_method?: string
          p_payment_reference?: string
        }
        Returns: string
      }
      register_portal_user: {
        Args: {
          p_access_level?: string
          p_email: string
          p_organization?: string
          p_username: string
        }
        Returns: Json
      }
      register_portal_user_with_password: {
        Args: {
          p_access_level?: string
          p_email: string
          p_organization?: string
          p_password: string
          p_username: string
        }
        Returns: Json
      }
      reject_chama_member: {
        Args: { member_id_to_reject: string }
        Returns: undefined
      }
      reject_join_request: { Args: { p_invitation_id: string }; Returns: Json }
      respond_to_lending_offer: {
        Args: { p_offer_id: string; p_response: string; p_user_pin: string }
        Returns: Json
      }
      revoke_chama_invitation: {
        Args: { p_invitation_id: string }
        Returns: Json
      }
      send_payment: {
        Args: {
          p_amount: number
          p_currency: string
          p_description?: string
          p_recipient_id: string
          p_sender_id: string
        }
        Returns: string
      }
      set_seller_password: {
        Args: {
          p_new_password: string
          p_session_token: string
          p_username: string
        }
        Returns: Json
      }
      set_user_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: Json
      }
      set_user_pin_enhanced: {
        Args: { p_pin: string; p_user_id: string }
        Returns: Json
      }
      submit_join_request: {
        Args: {
          p_email: string
          p_full_name: string
          p_invitation_token: string
          p_phone_number: string
        }
        Returns: Json
      }
      toggle_chama_fund_lock: {
        Args: { p_chama_id: string; p_lock_status: boolean }
        Returns: Json
      }
      transfer_funds: {
        Args: {
          p_amount: number
          p_fee: number
          p_receiver_id: string
          p_sender_id: string
        }
        Returns: Json
      }
      update_chama_metrics: {
        Args: { target_chama_id: string }
        Returns: undefined
      }
      update_wallet_balance_atomic: {
        Args: {
          p_amount: number
          p_description?: string
          p_metadata?: Json
          p_payment_method?: string
          p_reference: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: Json
      }
      verify_chama_payment: {
        Args: {
          p_amount: number
          p_payment_method: string
          p_payment_reference: string
          p_verification_data: Json
        }
        Returns: Json
      }
      verify_portal_session: {
        Args: { p_session_token: string }
        Returns: Json
      }
      verify_user_pin_enhanced: {
        Args: { p_pin: string; p_user_id: string }
        Returns: Json
      }
      verify_user_pin_v2: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
      withdraw_from_savings_account: {
        Args: {
          p_account_id: string
          p_amount: number
          p_payment_method?: string
          p_payment_reference?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      transaction_category:
        | "topup"
        | "contribution"
        | "withdrawal"
        | "transfer"
        | "payout"
        | "mgr_payout"
        | "savings"
        | "loan"
        | "fee"
      transaction_status_v2:
        | "pending"
        | "completed"
        | "failed"
        | "cancelled"
        | "processing"
      wallet_type: "chama_view_only" | "mgr" | "personal" | "chama_central"
    }
    CompositeTypes: {
      p2p_listing_with_profile: {
        id: string | null
        user_id: string | null
        type: string | null
        asset: string | null
        amount: number | null
        price_per_unit: number | null
        currency: string | null
        payment_method: string | null
        description: string | null
        is_active: boolean | null
        created_at: string | null
        user_profiles: Json | null
      }
      pending_member_info: {
        id: string | null
        user_id: string | null
        joined_at: string | null
        email: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      transaction_category: [
        "topup",
        "contribution",
        "withdrawal",
        "transfer",
        "payout",
        "mgr_payout",
        "savings",
        "loan",
        "fee",
      ],
      transaction_status_v2: [
        "pending",
        "completed",
        "failed",
        "cancelled",
        "processing",
      ],
      wallet_type: ["chama_view_only", "mgr", "personal", "chama_central"],
    },
  },
} as const
