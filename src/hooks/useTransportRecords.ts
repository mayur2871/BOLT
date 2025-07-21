import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];
type TransportRecordInsert = Database['public']['Tables']['transport_records']['Insert'];
type TransportRecordUpdate = Database['public']['Tables']['transport_records']['Update'];

export function useTransportRecords() {
  const [records, setRecords] = useState<TransportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all records
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transport_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add new record
  const addRecord = async (record: TransportRecordInsert) => {
    try {
      const { data, error } = await supabase
        .from('transport_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add record');
      throw err;
    }
  };

  // Update record
  const updateRecord = async (id: string, updates: TransportRecordUpdate) => {
    try {
      const { data, error } = await supabase
        .from('transport_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(record => record.id === id ? data : record));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
      throw err;
    }
  };

  // Delete record
  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transport_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords
  };
}