import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type LumpSumPayment = Database['public']['Tables']['lump_sum_payments']['Row'];
type LumpSumPaymentInsert = Database['public']['Tables']['lump_sum_payments']['Insert'];
type LumpSumPaymentUpdate = Database['public']['Tables']['lump_sum_payments']['Update'];

export function useLumpSumPayments() {
  const [lumpSumPayments, setLumpSumPayments] = useState<LumpSumPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all lump sum payments
  const fetchLumpSumPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lump_sum_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLumpSumPayments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add new lump sum payment
  const addLumpSumPayment = async (payment: LumpSumPaymentInsert) => {
    try {
      // Set remaining_balance to the same as amount initially
      const paymentWithBalance = {
        ...payment,
        remaining_balance: payment.amount
      };

      const { data, error } = await supabase
        .from('lump_sum_payments')
        .insert([paymentWithBalance])
        .select()
        .single();

      if (error) throw error;
      setLumpSumPayments(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lump sum payment');
      throw err;
    }
  };

  // Update lump sum payment
  const updateLumpSumPayment = async (id: string, updates: LumpSumPaymentUpdate) => {
    try {
      const { data, error } = await supabase
        .from('lump_sum_payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLumpSumPayments(prev => prev.map(payment => payment.id === id ? data : payment));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lump sum payment');
      throw err;
    }
  };

  // Delete lump sum payment
  const deleteLumpSumPayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lump_sum_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLumpSumPayments(prev => prev.filter(payment => payment.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lump sum payment');
      throw err;
    }
  };

  // Update remaining balance after allocation
  const updateRemainingBalance = async (id: string, newBalance: number) => {
    try {
      await updateLumpSumPayment(id, { remaining_balance: newBalance });
    } catch (err) {
      console.error('Error updating remaining balance:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchLumpSumPayments();
  }, []);

  return {
    lumpSumPayments,
    loading,
    error,
    addLumpSumPayment,
    updateLumpSumPayment,
    deleteLumpSumPayment,
    updateRemainingBalance,
    refetch: fetchLumpSumPayments
  };
}