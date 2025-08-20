import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSavedOptions() {
  const [savedTrucks, setSavedTrucks] = useState<string[]>([]);
  const [savedTransports, setSavedTransports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved trucks
  const fetchTrucks = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_trucks')
        .select('truck_no')
        .order('truck_no');

      if (error) throw error;
      setSavedTrucks(data?.map(item => item.truck_no) || []);
    } catch (err) {
      console.error('Error fetching trucks:', err);
    }
  };

  // Fetch saved transports
  const fetchTransports = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_transports')
        .select('transport_name')
        .order('transport_name');

      if (error) throw error;
      setSavedTransports(data?.map(item => item.transport_name) || []);
    } catch (err) {
      console.error('Error fetching transports:', err);
    }
  };

  // Add new truck
  const addTruck = async (truckNo: string) => {
    try {
      const { error } = await supabase
        .from('saved_trucks')
        .insert([{ truck_no: truckNo }]);

      if (error) throw error;
      setSavedTrucks(prev => [...prev, truckNo].sort());
    } catch (err) {
      console.error('Error adding truck:', err);
      throw err;
    }
  };

  // Add new transport
  const addTransport = async (transportName: string) => {
    try {
      const { error } = await supabase
        .from('saved_transports')
        .insert([{ transport_name: transportName }]);

      if (error) throw error;
      setSavedTransports(prev => [...prev, transportName].sort());
    } catch (err) {
      console.error('Error adding transport:', err);
      throw err;
    }
  };

  // Extract unique options from existing records
  const updateOptionsFromRecords = async (records: any[]) => {
    const trucks = [...new Set(records.map(r => r.truckno).filter(Boolean))];
    const transports = [...new Set(records.map(r => r.transport).filter(Boolean))];

    // Add any new trucks that aren't already saved
    for (const truck of trucks) {
      if (!savedTrucks.includes(truck)) {
        try {
          await addTruck(truck);
        } catch (err) {
          // Ignore duplicates
        }
      }
    }

    // Add any new transports that aren't already saved
    for (const transport of transports) {
      if (!savedTransports.includes(transport)) {
        try {
          await addTransport(transport);
        } catch (err) {
          // Ignore duplicates
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTrucks(), fetchTransports()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    savedTrucks,
    savedTransports,
    loading,
    addTruck,
    addTransport,
    updateOptionsFromRecords,
    refetch: () => Promise.all([fetchTrucks(), fetchTransports()])
  };
}