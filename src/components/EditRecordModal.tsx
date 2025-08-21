import React, { useState } from 'react';
import { X, Save, Truck } from 'lucide-react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { useTransportRecords } from '../hooks/useTransportRecords';
import { useSavedOptions } from '../hooks/useSavedOptions';
import { transformFormDataToUppercase } from '../utils/textTransform';
import type { Database } from '../lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

interface EditRecordModalProps {
  record: TransportRecord;
  onClose: () => void;
  onSave: () => void;
}

export function EditRecordModal({ record, onClose, onSave }: EditRecordModalProps) {
  const [formData, setFormData] = useState({
    srno: record.srno || '',
    smsdate: record.smsdate || '',
    lrdate: record.lrdate || '',
    biltyno: record.biltyno || '',
    truckno: record.truckno || '',
    transport: record.transport || '',
    destination: record.destination || '',
    weight: record.weight || '',
    rate: record.rate || '',
    total: record.total || '',
    biltycharge: record.biltycharge || '',
    freightamount: record.freightamount || '',
    advance: record.advance || '',
    advancedate: record.advancedate || '',
    commission: record.commission || '',
    balpaidamount: record.balpaidamount || '',
    balpaiddate: record.balpaiddate || '',
    netamount: record.netamount || '',
    isbalpaid: record.isbalpaid || 'NO',
    dateofreach: record.dateofreach || '',
    dateofunload: record.dateofunload || '',
    dayinhold: record.dayinhold || '',
    holdingcharge: record.holdingcharge || '',
    totalholdingamount: record.totalholdingamount || '',
    courierdate: record.courierdate || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transformedData = transformFormDataToUppercase(formData);
      await updateRecord(record.id, transformedData);
      alert('RECORD UPDATED SUCCESSFULLY!');
      onSave();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('FAILED TO UPDATE RECORD. PLEASE TRY AGAIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTruck = async (truckNo: string) => {
    try {
      await addTruck(truckNo);
    } catch (error) {
      console.error('Error adding truck:', error);
    }
  };

  const handleAddTransport = async (transportName: string) => {
    try {
      await addTransport(transportName);
    } catch (error) {
      console.error('Error adding transport:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Truck className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">EDIT TRANSPORT RECORD</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">BASIC INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="SR NO"
                value={formData.srno}
                onChange={(value) => handleInputChange('srno', value)}
              />
              <InputField
                label="SMS DATE"
                value={formData.smsdate}
                onChange={(value) => handleInputChange('smsdate', value)}
                type="date"
              />
              <InputField
                label="LR DATE"
                value={formData.lrdate}
                onChange={(value) => handleInputChange('lrdate', value)}
                type="date"
              />
              <InputField
                label="BILTY NO"
                value={formData.biltyno}
                onChange={(value) => handleInputChange('biltyno', value)}
              />
            </div>
          </div>

          {/* Transport Details */}
          <div className="form-section">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">TRANSPORT DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="TRUCK NO"
                value={formData.truckno}
                onChange={(value) => handleInputChange('truckno', value)}
                options={savedTrucks}
                allowCustom={true}
                onAddNew={handleAddTruck}
              />
              <SelectField
                label="TRANSPORT"
                value={formData.transport}
                onChange={(value) => handleInputChange('transport', value)}
                options={savedTransports}
                allowCustom={true}
                onAddNew={handleAddTransport}
                required
              />
              <InputField
                label="DESTINATION"
                value={formData.destination}
                onChange={(value) => handleInputChange('destination', value)}
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="form-section">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">FINANCIAL INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="WEIGHT"
                value={formData.weight}
                onChange={(value) => handleInputChange('weight', value)}
                required
              />
              <InputField
                label="RATE"
                value={formData.rate}
                onChange={(value) => handleInputChange('rate', value)}
                required
              />
              <InputField
                label="TOTAL"
                value={formData.total}
                onChange={(value) => handleInputChange('total', value)}
                type="number"
                required
              />
              <InputField
                label="ADVANCE"
                value={formData.advance}
                onChange={(value) => handleInputChange('advance', value)}
                type="number"
                required
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className="form-section">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">PAYMENT STATUS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SelectField
                label="IS BALANCE PAID"
                value={formData.isbalpaid}
                onChange={(value) => handleInputChange('isbalpaid', value)}
                options={['YES', 'NO']}
                required
              />
              <InputField
                label="BALANCE PAID AMOUNT"
                value={formData.balpaidamount}
                onChange={(value) => handleInputChange('balpaidamount', value)}
                type="number"
              />
              <InputField
                label="BALANCE PAID DATE"
                value={formData.balpaiddate}
                onChange={(value) => handleInputChange('balpaiddate', value)}
                type="date"
              />
              <InputField
                label="NET AMOUNT"
                value={formData.netamount}
                onChange={(value) => handleInputChange('netamount', value)}
                type="number"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}