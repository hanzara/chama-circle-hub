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
          approved_at: string | null
          approved_by: string | null
          borrower_id: string | null
          chama_id: string | null
          created_at: string | null
          duration_months: number
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          purpose: string
          status: string | null
          total_repayment: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          duration_months: number
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          purpose: string
          status?: string | null
          total_repayment?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          purpose?: string
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
          borrower_id: string | null
          chama_id: string | null
          created_at: string | null
          due_date: string | null
          duration_months: number
          id: string
          interest_rate: number | null
          repaid_amount: number | null
          status: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          due_date?: string | null
          duration_months: number
          id?: string
          interest_rate?: number | null
          repaid_amount?: number | null
          status?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          borrower_id?: string | null
          chama_id?: string | null
          created_at?: string | null
          due_date?: string | null
          duration_months?: number
          id?: string
          interest_rate?: number | null
          repaid_amount?: number | null
          status?: string | null
        }
        Relationships: [
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
      chama_members: {
        Row: {
          auto_debit_enabled: boolean | null
          chama_id: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_contribution_date: string | null
          role: string | null
          total_contributed: number | null
          user_id: string
        }
        Insert: {
          auto_debit_enabled?: boolean | null
          chama_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_contribution_date?: string | null
          role?: string | null
          total_contributed?: number | null
          user_id: string
        }
        Update: {
          auto_debit_enabled?: boolean | null
          chama_id?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_contribution_date?: string | null
          role?: string | null
          total_contributed?: number | null
          user_id?: string
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
            isOneToOne: false
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
          category_id: string | null
          contribution_amount: number
          contribution_frequency: string
          created_at: string | null
          created_by: string
          current_members: number | null
          description: string | null
          id: string
          max_members: number | null
          name: string
          status: string | null
          total_savings: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          contribution_amount: number
          contribution_frequency?: string
          created_at?: string | null
          created_by: string
          current_members?: number | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          status?: string | null
          total_savings?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          contribution_amount?: number
          contribution_frequency?: string
          created_at?: string | null
          created_by?: string
          current_members?: number | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          status?: string | null
          total_savings?: number | null
          updated_at?: string | null
        }
        Relationships: [
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
      member_invitations: {
        Row: {
          accepted_at: string | null
          chama_id: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          phone_number: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          chama_id: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          phone_number?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          chama_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          phone_number?: string | null
          status?: string
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
      mpesa_transactions: {
        Row: {
          amount: number
          callback_data: Json | null
          chama_id: string | null
          checkout_request_id: string | null
          created_at: string
          id: string
          merchant_request_id: string | null
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
      profiles: {
        Row: {
          country: string | null
          created_at: string
          credit_score: number | null
          email: string | null
          full_name: string | null
          id: string
          loan_eligibility: number | null
          phone_number: string | null
          preferred_language: string | null
          region: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          loan_eligibility?: number | null
          phone_number?: string | null
          preferred_language?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          credit_score?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          loan_eligibility?: number | null
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
          created_at: string
          currency: string | null
          description: string | null
          id: string
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
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
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: Json
      }
      assign_role_with_credential: {
        Args: {
          p_chama_id: string
          p_credential_type: string
          p_credential_value: string
        }
        Returns: Json
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
      convert_currency: {
        Args: {
          p_amount: number
          p_from_currency: string
          p_to_currency: string
          p_user_id: string
        }
        Returns: string
      }
      create_member_credential: {
        Args: {
          p_chama_id: string
          p_credential_type: string
          p_credential_value: string
        }
        Returns: Json
      }
      create_p2p_trade: {
        Args: { p_listing_id: string }
        Returns: string
      }
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
      disburse_peer_loan: {
        Args: { p_offer_id: string; p_user_pin: string }
        Returns: Json
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
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
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["CompositeTypes"]["p2p_listing_with_profile"][]
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
      initiate_mpesa_payment: {
        Args: {
          p_account_reference?: string
          p_amount: number
          p_phone_number: string
          p_transaction_desc?: string
        }
        Returns: Json
      }
      is_chama_admin: {
        Args: { chama_id_to_check: string }
        Returns: boolean
      }
      is_chama_admin_or_treasurer: {
        Args: { chama_id_to_check: string }
        Returns: boolean
      }
      is_chama_member: {
        Args: { chama_id_to_check: string }
        Returns: boolean
      }
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
      reject_chama_member: {
        Args: { member_id_to_reject: string }
        Returns: undefined
      }
      respond_to_lending_offer: {
        Args: { p_offer_id: string; p_response: string; p_user_pin: string }
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
      set_user_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: Json
      }
      update_chama_metrics: {
        Args: { target_chama_id: string }
        Returns: undefined
      }
      verify_user_pin_v2: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
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
