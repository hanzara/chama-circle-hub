export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone_number: string | null
          id_number: string | null
          address: string | null
          occupation: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          id: string
          full_name: string
          phone_number?: string | null
          id_number?: string | null
          address?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          id?: string
          full_name?: string
          phone_number?: string | null
          id_number?: string | null
          address?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
          email?: string | null
          user_id?: string
        }
      }
      chamas: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          contribution_amount: number
          contribution_frequency: string
          max_members: number | null
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          contribution_amount: number
          contribution_frequency?: string
          max_members?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          contribution_amount?: number
          contribution_frequency?: string
          max_members?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      chama_members: {
        Row: {
          id: string
          chama_id: string
          user_id: string
          role: 'admin' | 'treasurer' | 'secretary' | 'member'
          joined_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          chama_id: string
          user_id: string
          role?: 'admin' | 'treasurer' | 'secretary' | 'member'
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          chama_id?: string
          user_id?: string
          role?: 'admin' | 'treasurer' | 'secretary' | 'member'
          joined_at?: string
          is_active?: boolean
        }
      }
      chama_messages: {
        Row: {
          id: string
          chama_id: string
          sender_id: string
          message: string
          sent_at: string
        }
        Insert: {
          id?: string
          chama_id: string
          sender_id: string
          message: string
          sent_at?: string
        }
        Update: {
          id?: string
          chama_id?: string
          sender_id?: string
          message?: string
          sent_at?: string
        }
      }
      contributions: {
        Row: {
          id: string
          chama_id: string
          member_id: string
          amount: number
          contribution_date: string
          payment_method: string | null
          reference_number: string | null
          status: 'pending' | 'completed' | 'overdue'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chama_id: string
          member_id: string
          amount: number
          contribution_date: string
          payment_method?: string | null
          reference_number?: string | null
          status?: 'pending' | 'completed' | 'overdue'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chama_id?: string
          member_id?: string
          amount?: number
          contribution_date?: string
          payment_method?: string | null
          reference_number?: string | null
          status?: 'pending' | 'completed' | 'overdue'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          chama_id: string
          borrower_id: string
          amount: number
          interest_rate: number
          purpose: string
          repayment_period_months: number
          monthly_payment: number
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
          approved_by: string | null
          approved_at: string | null
          disbursed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chama_id: string
          borrower_id: string
          amount: number
          interest_rate: number
          purpose: string
          repayment_period_months: number
          monthly_payment: number
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
          approved_by?: string | null
          approved_at?: string | null
          disbursed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chama_id?: string
          borrower_id?: string
          amount?: number
          interest_rate?: number
          purpose?: string
          repayment_period_months?: number
          monthly_payment?: number
          status?: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
          approved_by?: string | null
          approved_at?: string | null
          disbursed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mpesa_transactions: {
        Row: {
          id: string
          user_id: string
          phone_number: string
          amount: number
          transaction_type: 'stk_push' | 'b2c' | 'c2b'
          purpose: 'contribution' | 'registration' | 'loan_repayment' | 'loan_disbursement' | 'other'
          chama_id: string | null
          merchant_request_id: string | null
          checkout_request_id: string | null
          receipt_number: string | null
          result_code: number | null
          result_description: string | null
          status: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
          callback_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_number: string
          amount: number
          transaction_type: 'stk_push' | 'b2c' | 'c2b'
          purpose: 'contribution' | 'registration' | 'loan_repayment' | 'loan_disbursement' | 'other'
          chama_id?: string | null
          merchant_request_id?: string | null
          checkout_request_id?: string | null
          receipt_number?: string | null
          result_code?: number | null
          result_description?: string | null
          status?: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
          callback_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string
          amount?: number
          transaction_type?: 'stk_push' | 'b2c' | 'c2b'
          purpose?: 'contribution' | 'registration' | 'loan_repayment' | 'loan_disbursement' | 'other'
          chama_id?: string | null
          merchant_request_id?: string | null
          checkout_request_id?: string | null
          receipt_number?: string | null
          result_code?: number | null
          result_description?: string | null
          status?: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
          callback_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          user_id: string | null
          amount: number
          type: 'deposit' | 'withdrawal' | 'transfer'
          currency: string
          description: string | null
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          reference_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount: number
          type: 'deposit' | 'withdrawal' | 'transfer'
          currency?: string
          description?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          reference_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          amount?: number
          type?: 'deposit' | 'withdrawal' | 'transfer'
          currency?: string
          description?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          reference_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chama_activities: {
        Row: {
          id: string
          chama_id: string
          user_id: string | null
          activity_type: 'contribution' | 'loan_application' | 'loan_approval' | 'member_joined' | 'meeting_scheduled' | 'payment' | 'other'
          description: string
          amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          chama_id: string
          user_id?: string | null
          activity_type: 'contribution' | 'loan_application' | 'loan_approval' | 'member_joined' | 'meeting_scheduled' | 'payment' | 'other'
          description: string
          amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          chama_id?: string
          user_id?: string | null
          activity_type?: 'contribution' | 'loan_application' | 'loan_approval' | 'member_joined' | 'meeting_scheduled' | 'payment' | 'other'
          description?: string
          amount?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'treasurer' | 'secretary' | 'member'
      contribution_status: 'pending' | 'completed' | 'overdue'
      loan_status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
      transaction_status: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
      payment_purpose: 'contribution' | 'registration' | 'loan_repayment' | 'loan_disbursement' | 'other'
    }
  }
}
