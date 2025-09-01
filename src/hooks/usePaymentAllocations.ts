import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type PaymentAllocation = Database['public']['Tables']['payment_allocations']['Row'];
type PaymentAllocationInsert = Database['public']['Tables']['payment_allocations']['Insert'];

export function usePaymentAllocations() {
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all payment allocations
  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_allocations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add new payment allocation
  const addAllocation = async (allocation: PaymentAllocationInsert) => {
    try {
      const { data, error } = await supabase
        .from('payment_allocations')
        .insert([allocation])
        .select()
        .single();

      if (error) throw error;
      setAllocations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add allocation');
      throw err;
    }
  };

  // Get allocations for a specific transport record
  const getAllocationsForRecord = async (transportRecordId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_allocations')
        .select('*')
        .eq('transport_record_id', transportRecordId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching allocations for record:', err);
      return [];
    }
  };

  // Get allocations for a specific lump sum payment
  const getAllocationsForLumpSum = async (lumpSumPaymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_allocations')
        .select(`
          *,
          transport_records (
            srno,
            truckno,
            transport,
            destination,
            total
          )
        `)
        .eq('lump_sum_payment_id', lumpSumPaymentId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching allocations for lump sum:', err);
      return [];
    }
  };

  // Delete allocation
  const deleteAllocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_allocations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAllocations(prev => prev.filter(allocation => allocation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete allocation');
      throw err;
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  return {
    allocations,
    loading,
    error,
    addAllocation,
    getAllocationsForRecord,
    getAllocationsForLumpSum,
    deleteAllocation,
    refetch: fetchAllocations
  };
}