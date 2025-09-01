import React, { useState } from 'react';
import { DollarSign, Plus, ArrowRight, Eye, Trash2, Building } from 'lucide-react';
import { LumpSumEntryForm } from './LumpSumEntryForm';
import { LumpSumAllocationTool } from './LumpSumAllocationTool';
import { useLumpSumPayments } from '../hooks/useLumpSumPayments';
import { usePaymentAllocations } from '../hooks/usePaymentAllocations';

type LumpSumView = 'list' | 'add' | 'allocate';

export function LumpSumManagement() {
  const [currentView, setCurrentView] = useState<LumpSumView>('list');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { lumpSumPayments, deleteLumpSumPayment, loading } = useLumpSumPayments();
  const { getAllocationsForLumpSum } = usePaymentAllocations();

  const handlePaymentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('list');
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('ARE YOU SURE YOU WANT TO DELETE THIS LUMP SUM PAYMENT?')) {
      try {
        await deleteLumpSumPayment(id);
        alert('LUMP SUM PAYMENT DELETED SUCCESSFULLY!');
      } catch (error) {
        alert('FAILED TO DELETE PAYMENT. PLEASE TRY AGAIN.');
      }
    }
  };

  const ViewButton = ({ 
    view, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    view: LumpSumView; 
    icon: React.ComponentType<any>; 
    label: string; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-green-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg text-gray-600">LOADING LUMP SUM PAYMENTS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">LUMP SUM PAYMENTS</h2>
        </div>
        
        {/* View Navigation */}
        <div className="flex space-x-2">
          <ViewButton
            view="list"
            icon={Eye}
            label="VIEW PAYMENTS"
            isActive={currentView === 'list'}
          />
          <ViewButton
            view="add"
            icon={Plus}
            label="ADD PAYMENT"
            isActive={currentView === 'add'}
          />
          <ViewButton
            view="allocate"
            icon={ArrowRight}
            label="ALLOCATE"
            isActive={currentView === 'allocate'}
          />
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === 'add' && (
        <LumpSumEntryForm onPaymentAdded={handlePaymentAdded} />
      )}

      {currentView === 'allocate' && (
        <LumpSumAllocationTool key={refreshTrigger} />
      )}

      {currentView === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">LUMP SUM PAYMENTS HISTORY</h3>
          </div>
          
          {lumpSumPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">NO LUMP SUM PAYMENTS</h3>
              <p className="mt-1 text-sm text-gray-500">
                START BY ADDING YOUR FIRST LUMP SUM PAYMENT
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPANY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TOTAL AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      REMAINING BALANCE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE RECEIVED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lumpSumPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.company_name}
                            </div>
                            {payment.notes && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {payment.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          payment.remaining_balance > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          ₹{payment.remaining_balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.date_received}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.remaining_balance > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {payment.remaining_balance > 0 ? 'PARTIAL' : 'FULLY ALLOCATED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {payment.remaining_balance > 0 && (
                            <button
                              onClick={() => {
                                setCurrentView('allocate');
                                // This will be handled by the allocation tool
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="ALLOCATE PAYMENT"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="DELETE PAYMENT"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}