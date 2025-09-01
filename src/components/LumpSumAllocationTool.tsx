import React, { useState, useEffect } from 'react';
import { ArrowRight, DollarSign, Truck, Package, AlertCircle, Check } from 'lucide-react';
import { useLumpSumPayments } from '../hooks/useLumpSumPayments';
import { usePaymentAllocations } from '../hooks/usePaymentAllocations';
import { useTransportRecords } from '../hooks/useTransportRecords';
import type { Database } from '../lib/supabase';

type LumpSumPayment = Database['public']['Tables']['lump_sum_payments']['Row'];
type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

export function LumpSumAllocationTool() {
  const { lumpSumPayments, updateRemainingBalance } = useLumpSumPayments();
  const { addAllocation } = usePaymentAllocations();
  const { records, updateRecord } = useTransportRecords();
  
  const [selectedLumpSum, setSelectedLumpSum] = useState<LumpSumPayment | null>(null);
  const [allocations, setAllocations] = useState<{ [recordId: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Filter records that have outstanding balances
  const outstandingRecords = records.filter(record => {
    const total = parseFloat(record.total || '0');
    const advance = parseFloat(record.advance || '0');
    const balPaid = parseFloat(record.balpaidamount || '0');
    const lumpSumAllocated = parseFloat(record.lump_sum_allocated_amount?.toString() || '0');
    const commission = parseFloat(record.commission || '0');
    
    const totalPaid = advance + balPaid + lumpSumAllocated + commission;
    return total > totalPaid;
  });

  // Calculate remaining amount for a record
  const getRemainingAmount = (record: TransportRecord): number => {
    const total = parseFloat(record.total || '0');
    const advance = parseFloat(record.advance || '0');
    const balPaid = parseFloat(record.balpaidamount || '0');
    const lumpSumAllocated = parseFloat(record.lump_sum_allocated_amount?.toString() || '0');
    const commission = parseFloat(record.commission || '0');
    
    return total - advance - balPaid - lumpSumAllocated - commission;
  };

  // Calculate total allocation amount
  const getTotalAllocation = (): number => {
    return Object.values(allocations).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  // Handle allocation input change
  const handleAllocationChange = (recordId: string, amount: string) => {
    setAllocations(prev => ({
      ...prev,
      [recordId]: amount
    }));
  };

  // Process allocations
  const handleProcessAllocations = async () => {
    if (!selectedLumpSum) return;

    const totalAllocation = getTotalAllocation();
    
    if (totalAllocation > selectedLumpSum.remaining_balance) {
      alert('TOTAL ALLOCATION EXCEEDS AVAILABLE BALANCE!');
      return;
    }

    if (totalAllocation <= 0) {
      alert('PLEASE ENTER ALLOCATION AMOUNTS!');
      return;
    }

    setLoading(true);

    try {
      // Process each allocation
      for (const [recordId, amount] of Object.entries(allocations)) {
        const allocationAmount = parseFloat(amount);
        if (allocationAmount > 0) {
          // Add allocation record
          await addAllocation({
            lump_sum_payment_id: selectedLumpSum.id,
            transport_record_id: recordId,
            allocated_amount: allocationAmount,
            allocation_date: new Date().toISOString().split('T')[0]
          });

          // Update transport record with new lump sum allocated amount
          const record = records.find(r => r.id === recordId);
          if (record) {
            const currentLumpSumAllocated = parseFloat(record.lump_sum_allocated_amount?.toString() || '0');
            const newLumpSumAllocated = currentLumpSumAllocated + allocationAmount;
            
            await updateRecord(recordId, {
              lump_sum_allocated_amount: newLumpSumAllocated
            });
          }
        }
      }

      // Update lump sum remaining balance
      const newRemainingBalance = selectedLumpSum.remaining_balance - totalAllocation;
      await updateRemainingBalance(selectedLumpSum.id, newRemainingBalance);

      // Reset form
      setAllocations({});
      setSelectedLumpSum(null);
      
      alert('ALLOCATIONS PROCESSED SUCCESSFULLY!');
    } catch (error) {
      console.error('Error processing allocations:', error);
      alert('FAILED TO PROCESS ALLOCATIONS. PLEASE TRY AGAIN.');
    } finally {
      setLoading(false);
    }
  };

  // Filter lump sums with remaining balance
  const availableLumpSums = lumpSumPayments.filter(payment => payment.remaining_balance > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <ArrowRight className="w-6 h-6 text-green-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">LUMP SUM ALLOCATION</h2>
      </div>

      {/* Lump Sum Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">SELECT LUMP SUM PAYMENT</h3>
        
        {availableLumpSums.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">NO AVAILABLE LUMP SUMS</h3>
            <p className="mt-1 text-sm text-gray-500">
              ALL LUMP SUM PAYMENTS HAVE BEEN FULLY ALLOCATED
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLumpSums.map((payment) => (
              <div
                key={payment.id}
                onClick={() => setSelectedLumpSum(payment)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedLumpSum?.id === payment.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{payment.company_name}</h4>
                  {selectedLumpSum?.id === payment.id && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  TOTAL: ₹{payment.amount.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-green-600">
                  AVAILABLE: ₹{payment.remaining_balance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {payment.date_received}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocation Interface */}
      {selectedLumpSum && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              ALLOCATE TO OUTSTANDING RECORDS
            </h3>
            <div className="text-right">
              <p className="text-sm text-gray-600">AVAILABLE BALANCE</p>
              <p className="text-xl font-bold text-green-600">
                ₹{selectedLumpSum.remaining_balance.toLocaleString()}
              </p>
            </div>
          </div>

          {outstandingRecords.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">NO OUTSTANDING RECORDS</h3>
              <p className="mt-1 text-sm text-gray-500">
                ALL TRANSPORT RECORDS HAVE BEEN FULLY PAID
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RECORD DETAILS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REMAINING AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ALLOCATE AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {outstandingRecords.map((record) => {
                      const remainingAmount = getRemainingAmount(record);
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.truckno || 'N/A'} - {record.transport || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.destination || 'N/A'} | SR: {record.srno || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">
                                TOTAL: ₹{record.total || '0'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-red-600">
                              ₹{remainingAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={allocations[record.id] || ''}
                              onChange={(e) => handleAllocationChange(record.id, e.target.value)}
                              placeholder="0"
                              max={Math.min(remainingAmount, selectedLumpSum.remaining_balance)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Allocation Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    TOTAL ALLOCATION:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{getTotalAllocation().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium text-gray-700">
                    REMAINING AFTER ALLOCATION:
                  </span>
                  <span className={`text-lg font-bold ${
                    selectedLumpSum.remaining_balance - getTotalAllocation() >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    ₹{(selectedLumpSum.remaining_balance - getTotalAllocation()).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Process Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleProcessAllocations}
                  disabled={loading || getTotalAllocation() <= 0}
                  className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>{loading ? 'PROCESSING...' : 'PROCESS ALLOCATIONS'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}