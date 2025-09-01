import React from 'react';
import { X, Truck, MapPin, Calendar, DollarSign, Package, FileText } from 'lucide-react';
import type { Database } from '../lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

interface RecordDetailsModalProps {
  record: TransportRecord;
  onClose: () => void;
}

export function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
  const DetailRow = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value: string | null; 
    icon?: React.ComponentType<any>;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-400 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-sm text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">RECORD DETAILS</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              BASIC INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DetailRow label="SR NO" value={record.srno} />
                <DetailRow label="SMS DATE" value={record.smsdate} icon={Calendar} />
                <DetailRow label="LR DATE" value={record.lrdate} icon={Calendar} />
                <DetailRow label="BILTY NO" value={record.biltyno} />
              </div>
              <div>
                <DetailRow label="TRUCK NO" value={record.truckno} icon={Truck} />
                <DetailRow label="TRANSPORT" value={record.transport} />
                <DetailRow label="DESTINATION" value={record.destination} icon={MapPin} />
                <DetailRow label="WEIGHT" value={record.weight} icon={Package} />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              FINANCIAL INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DetailRow label="RATE" value={record.rate} />
                <DetailRow label="TOTAL" value={record.total} />
                <DetailRow label="BILTY CHARGE" value={record.biltycharge} />
                <DetailRow label="FREIGHT AMOUNT" value={record.freightamount} />
                <DetailRow label="ADVANCE" value={record.advance} />
                <DetailRow label="ADVANCE DATE" value={record.advancedate} icon={Calendar} />
              </div>
              <div>
                <DetailRow label="COMMISSION" value={record.commission} />
                <DetailRow label="BALANCE PAID AMOUNT" value={record.balpaidamount} />
                <DetailRow label="BALANCE PAID DATE" value={record.balpaiddate} icon={Calendar} />
                <DetailRow label="NET AMOUNT" value={record.netamount} />
                <DetailRow label="LUMP SUM ALLOCATED" value={record.lump_sum_allocated_amount?.toString() || '0'} />
                <DetailRow 
                  label="IS BALANCE PAID" 
                  value={
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.isbalpaid === 'YES'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.isbalpaid || 'NO'}
                    </span>
                  } 
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              DELIVERY INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DetailRow label="DATE OF REACH" value={record.dateofreach} icon={Calendar} />
                <DetailRow label="DATE OF UNLOAD" value={record.dateofunload} icon={Calendar} />
                <DetailRow label="COURIER DATE" value={record.courierdate} icon={Calendar} />
              </div>
              <div>
                <DetailRow label="DAYS IN HOLD" value={record.dayinhold} />
                <DetailRow label="HOLDING CHARGE" value={record.holdingcharge} />
                <DetailRow label="TOTAL HOLDING AMOUNT" value={record.totalholdingamount} />
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">SYSTEM INFORMATION</h3>
            <DetailRow 
              label="CREATED AT" 
              value={record.created_at ? new Date(record.created_at).toLocaleString() : null} 
              icon={Calendar} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}