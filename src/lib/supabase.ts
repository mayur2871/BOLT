import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rpjcorqhodzbizurbrol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwamNvcnFob2R6Yml6dXJicm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODA2NzcsImV4cCI6MjA2ODY1NjY3N30.5Vgaqf_222D9TB0587fQyEtNE6pfyZNpkVmbgAfoM6A";

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
          srno: string | null;
          smsdate: string | null;
          lrdate: string | null;
          biltyno: string | null;
          truckno: string | null;
          transport: string;
          destination: string;
          weight: string;
          rate: string;
          total: string;
          biltycharge: string | null;
          freightamount: string | null;
          advance: string;
          advancedate: string | null;
          commission: string;
          balpaidamount: string | null;
          balpaiddate: string | null;
          netamount: string | null;
          isbalpaid: string | null;
          dateofreach: string | null;
          dateofunload: string | null;
          dayinhold: string | null;
          holdingcharge: string | null;
          totalholdingamount: string | null;
          courierdate: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          srno?: string | null;
          smsdate?: string | null;
          lrdate?: string | null;
          biltyno?: string | null;
          truckno?: string | null;
          transport?: string;
          destination?: string;
          weight?: string;
          rate?: string;
          total?: string;
          biltycharge?: string | null;
          freightamount?: string | null;
          advance?: string;
          advancedate?: string | null;
          commission?: string;
          balpaidamount?: string | null;
          balpaiddate?: string | null;
          netamount?: string | null;
          isbalpaid?: string | null;
          dateofreach?: string | null;
          dateofunload?: string | null;
          dayinhold?: string | null;
          holdingcharge?: string | null;
          totalholdingamount?: string | null;
          courierdate?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          srno?: string | null;
          smsdate?: string | null;
          lrdate?: string | null;
          biltyno?: string | null;
          truckno?: string | null;
          transport?: string;
          destination?: string;
          weight?: string;
          rate?: string;
          total?: string;
          biltycharge?: string | null;
          freightamount?: string | null;
          advance?: string;
          advancedate?: string | null;
          commission?: string;
          balpaidamount?: string | null;
          balpaiddate?: string | null;
          netamount?: string | null;
          isbalpaid?: string | null;
          dateofreach?: string | null;
          dateofunload?: string | null;
          dayinhold?: string | null;
          holdingcharge?: string | null;
          totalholdingamount?: string | null;
          courierdate?: string | null;
          created_at?: string;
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