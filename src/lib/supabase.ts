import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      transport_records: {
        Row: {
          id: string;
          sr_no: string;
          sms_date: string;
          lr_date: string;
          bilty_no: string;
          truck_no: string;
          transport: string;
          destination: string;
          weight: string;
          rate: string;
          total: string;
          bilty_charge: string;
          freight_amount: string;
          advance: string;
          advance_date: string;
          commission: string;
          bal_paid_amount: string;
          bal_paid_date: string;
          net_amount: string;
          is_bal_paid: string;
          date_of_reach: string;
          date_of_unload: string;
          day_in_hold: string;
          holding_charge: string;
          total_holding_amount: string;
          courier_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sr_no?: string;
          sms_date?: string;
          lr_date?: string;
          bilty_no?: string;
          truck_no?: string;
          transport?: string;
          destination?: string;
          weight?: string;
          rate?: string;
          total?: string;
          bilty_charge?: string;
          freight_amount?: string;
          advance?: string;
          advance_date?: string;
          commission?: string;
          bal_paid_amount?: string;
          bal_paid_date?: string;
          net_amount?: string;
          is_bal_paid?: string;
          date_of_reach?: string;
          date_of_unload?: string;
          day_in_hold?: string;
          holding_charge?: string;
          total_holding_amount?: string;
          courier_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sr_no?: string;
          sms_date?: string;
          lr_date?: string;
          bilty_no?: string;
          truck_no?: string;
          transport?: string;
          destination?: string;
          weight?: string;
          rate?: string;
          total?: string;
          bilty_charge?: string;
          freight_amount?: string;
          advance?: string;
          advance_date?: string;
          commission?: string;
          bal_paid_amount?: string;
          bal_paid_date?: string;
          net_amount?: string;
          is_bal_paid?: string;
          date_of_reach?: string;
          date_of_unload?: string;
          day_in_hold?: string;
          holding_charge?: string;
          total_holding_amount?: string;
          courier_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_trucks: {
        Row: {
          id: string;
          truck_no: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          truck_no: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          truck_no?: string;
          created_at?: string;
        };
      };
      saved_transports: {
        Row: {
          id: string;
          transport_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          transport_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          transport_name?: string;
          created_at?: string;
        };
      };
    };
  };
};