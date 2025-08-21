import React, { useState } from 'react';
import { Truck, Package, MapPin, Calendar, DollarSign, FileText, Clock, Send } from 'lucide-react';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { TextAreaField } from './TextAreaField';
import { useTransportRecords } from '../hooks/useTransportRecords';
import { useSavedOptions } from '../hooks/useSavedOptions';
import { transformFormDataToUppercase } from '../utils/textTransform';

interface TransportRecordFormProps {
  onRecordAdded?: () => void;
}

interface FormData {
  srno: string;
  smsdate: string;
  lrdate: string;
  biltyno: string;
  truckno: string;
  transport: string;
  destination: string;
  weight: string;
  rate: string;
  total: string;
  biltycharge: string;
  freightamount: string;
  advance: string;
  advancedate: string;
  commission: string;
  balpaidamount: string;
  balpaiddate: string;
  netamount: string;
  isbalpaid: string;
  dateofreach: string;
  dateofunload: string;
  dayinhold: string;
  holdingcharge: string;
  totalholdingamount: string;
  courierdate: string;
}

const initialFormData: FormData = {
  srno: '',
  smsdate: '',
  lrdate: '',
  biltyno: '',
  truckno: '',
  transport: '',
  destination: '',
  weight: '',
  rate: '',
  total: '',
  biltycharge: '',
  freightamount: '',
  advance: '',
  advancedate: '',
  commission: '',
  balpaidamount: '',
  balpaiddate: '',
  netamount: '',
  isbalpaid: 'NO',
  dateofreach: '',
  dateofunload: '',
  dayinhold: '',
  holdingcharge: '',
  totalholdingamount: '',
  courierdate: ''
};

export function TransportRecordForm({ onRecordAdded }: TransportRecordFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transformedData = transformFormDataToUppercase(formData);
      await addRecord(transformedData);
      
      // Reset form
      setFormData(initialFormData);
      
      // Notify parent component
      onRecordAdded?.();
      
      alert('Transport record added successfully!');
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add transport record. Please try again.');
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-8">
        <Truck className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-800">Transport Record Entry</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="form-section">
          <h3>
            <FileText className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="SR NO"
              value={formData.srno}
              onChange={(value) => handleInputChange('srno', value)}
              placeholder="Enter serial number"
            />
            <InputField
              label="SMS Date"
              value={formData.smsdate}
              onChange={(value) => handleInputChange('smsdate', value)}
              type="date"
            />
            <InputField
              label="LR Date"
              value={formData.lrdate}
              onChange={(value) => handleInputChange('lrdate', value)}
              type="date"
            />
            <InputField
              label="Bilty No"
              value={formData.biltyno}
              onChange={(value) => handleInputChange('biltyno', value)}
              placeholder="Enter bilty number"
            />
          </div>
        </div>

        {/* Transport Details */}
        <div className="form-section">
          <h3>
            <Truck className="w-5 h-5 mr-2" />
            Transport Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Truck No"
              value={formData.truckno}
              onChange={(value) => handleInputChange('truckno', value)}
              options={savedTrucks}
              placeholder="Select or enter truck number"
              allowCustom={true}
              onAddNew={handleAddTruck}
            />
            <SelectField
              label="Transport"
              value={formData.transport}
              onChange={(value) => handleInputChange('transport', value)}
              options={savedTransports}
              placeholder="Select or enter transport name"
              allowCustom={true}
              onAddNew={handleAddTransport}
              required
            />
            <InputField
              label="Destination"
              value={formData.destination}
              onChange={(value) => handleInputChange('destination', value)}
              placeholder="Enter destination"
              required
            />
          </div>
        </div>

        {/* Weight & Rate Information */}
        <div className="form-section">
          <h3>
            <Package className="w-5 h-5 mr-2" />
            Weight & Rate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Weight"
              value={formData.weight}
              onChange={(value) => handleInputChange('weight', value)}
              placeholder="Enter weight"
              required
            />
            <InputField
              label="Rate"
              value={formData.rate}
              onChange={(value) => handleInputChange('rate', value)}
              placeholder="Enter rate"
              required
            />
            <InputField
              label="Total"
              value={formData.total}
              onChange={(value) => handleInputChange('total', value)}
              type="number"
              placeholder="Enter total amount"
              required
            />
            <InputField
              label="Bilty Charge"
              value={formData.biltycharge}
              onChange={(value) => handleInputChange('biltycharge', value)}
              type="number"
              placeholder="Enter bilty charge"
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="form-section">
          <h3>
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Freight Amount"
              value={formData.freightamount}
              onChange={(value) => handleInputChange('freightamount', value)}
              type="number"
              placeholder="Enter freight amount"
            />
            <InputField
              label="Advance"
              value={formData.advance}
              onChange={(value) => handleInputChange('advance', value)}
              type="number"
              placeholder="Enter advance amount"
              required
            />
            <InputField
              label="Advance Date"
              value={formData.advancedate}
              onChange={(value) => handleInputChange('advancedate', value)}
              type="date"
            />
            <InputField
              label="Commission"
              value={formData.commission}
              onChange={(value) => handleInputChange('commission', value)}
              type="number"
              placeholder="Enter commission"
              required
            />
          </div>
        </div>

        {/* Payment Information */}
        <div className="form-section">
          <h3>
            <DollarSign className="w-5 h-5 mr-2" />
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Balance Paid Amount"
              value={formData.balpaidamount}
              onChange={(value) => handleInputChange('balpaidamount', value)}
              type="number"
              placeholder="Enter balance paid amount"
            />
            <InputField
              label="Balance Paid Date"
              value={formData.balpaiddate}
              onChange={(value) => handleInputChange('balpaiddate', value)}
              type="date"
            />
            <InputField
              label="Net Amount"
              value={formData.netamount}
              onChange={(value) => handleInputChange('netamount', value)}
              type="number"
              placeholder="Enter net amount"
            />
            <SelectField
              label="Is Balance Paid"
              value={formData.isbalpaid}
              onChange={(value) => handleInputChange('isbalpaid', value)}
              options={['YES', 'NO']}
              required
            />
          </div>
        </div>

        {/* Delivery Information */}
        <div className="form-section">
          <h3>
            <MapPin className="w-5 h-5 mr-2" />
            Delivery Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Date of Reach"
              value={formData.dateofreach}
              onChange={(value) => handleInputChange('dateofreach', value)}
              type="date"
            />
            <InputField
              label="Date of Unload"
              value={formData.dateofunload}
              onChange={(value) => handleInputChange('dateofunload', value)}
              type="date"
            />
            <InputField
              label="Days in Hold"
              value={formData.dayinhold}
              onChange={(value) => handleInputChange('dayinhold', value)}
              type="number"
              placeholder="Enter days in hold"
            />
            <InputField
              label="Courier Date"
              value={formData.courierdate}
              onChange={(value) => handleInputChange('courierdate', value)}
              type="date"
            />
          </div>
        </div>

        {/* Holding Charges */}
        <div className="form-section">
          <h3>
            <Clock className="w-5 h-5 mr-2" />
            Holding Charges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Holding Charge"
              value={formData.holdingcharge}
              onChange={(value) => handleInputChange('holdingcharge', value)}
              type="number"
              placeholder="Enter holding charge per day"
            />
            <InputField
              label="Total Holding Amount"
              value={formData.totalholdingamount}
              onChange={(value) => handleInputChange('totalholdingamount', value)}
              type="number"
              placeholder="Enter total holding amount"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'ADDING RECORD...' : 'ADD TRANSPORT RECORD'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}