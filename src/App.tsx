import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Save, X, FileText, Truck, Calendar, MapPin, DollarSign, User, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useTransportRecords } from './hooks/useTransportRecords';
import { useSavedOptions } from './hooks/useSavedOptions';
import type { Database } from './lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];
type TransportRecordInsert = Database['public']['Tables']['transport_records']['Insert'];

function App() {
  const { records, loading: recordsLoading, error: recordsError, addRecord, updateRecord, deleteRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, loading: optionsLoading, addTruck, addTransport, updateOptionsFromRecords } = useSavedOptions();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTruckFormOpen, setIsTruckFormOpen] = useState(false);
  const [isTransportFormOpen, setIsTransportFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TransportRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<TransportRecordInsert>>({});
  const [newTruckNo, setNewTruckNo] = useState('');
  const [newTransportName, setNewTransportName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emptyRecord: Partial<TransportRecordInsert> = {
    sr_no: '',
    sms_date: '',
    lr_date: '',
    bilty_no: '',
    truck_no: '',
    transport: '',
    destination: '',
    weight: '',
    rate: '',
    total: '',
    bilty_charge: '',
    freight_amount: '',
    advance: '',
    advance_date: '',
    commission: '',
    bal_paid_amount: '',
    bal_paid_date: '',
    net_amount: '',
    is_bal_paid: 'NO',
    date_of_reach: '',
    date_of_unload: '',
    day_in_hold: '',
    holding_charge: '',
    total_holding_amount: '',
    courier_date: ''
  };

  useEffect(() => {
    if (records.length > 0) {
      updateOptionsFromRecords(records);
    }
  }, [records]);

  const handleInputChange = (field: keyof TransportRecordInsert, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total if rate and weight are available and rate is not FIX
      if (field === 'rate' || field === 'weight') {
        const rate = field === 'rate' ? value : (newData.rate || '');
        const weight = field === 'weight' ? value : (newData.weight || '');
        
        // Check if rate contains "FIX" (case insensitive)
        const isFixedRate = rate.toLowerCase().includes('fix');
        
        if (!isFixedRate && rate && weight) {
          // Extract numeric values for calculation
          const numericRate = parseFloat(rate.replace(/[^0-9.]/g, ''));
          const numericWeight = parseFloat(weight.replace(/[^0-9.]/g, ''));
          
          if (!isNaN(numericRate) && !isNaN(numericWeight)) {
            const calculatedTotal = (numericRate * numericWeight).toFixed(2);
            newData.total = calculatedTotal;
          }
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingRecord) {
        // Update existing record
        await updateRecord(editingRecord.id, formData);
      } else {
        // Add new record
        const nextSrNo = (records.length + 1).toString();
        const newRecord: TransportRecordInsert = {
          ...emptyRecord,
          ...formData,
          sr_no: nextSrNo
        };
        await addRecord(newRecord);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTruckNo.trim()) {
      try {
        await addTruck(newTruckNo.trim());
        setNewTruckNo('');
        setIsTruckFormOpen(false);
      } catch (error) {
        console.error('Error adding truck:', error);
        alert('Failed to add truck. It may already exist.');
      }
    }
  };

  const handleAddTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransportName.trim()) {
      try {
        await addTransport(newTransportName.trim());
        setNewTransportName('');
        setIsTransportFormOpen(false);
      } catch (error) {
        console.error('Error adding transport:', error);
        alert('Failed to add transport. It may already exist.');
      }
    }
  };

  const handleEdit = (record: TransportRecord) => {
    setEditingRecord(record);
    // Convert database field names to form field names
    const formRecord = {
      sr_no: record.sr_no,
      sms_date: record.sms_date,
      lr_date: record.lr_date,
      bilty_no: record.bilty_no,
      truck_no: record.truck_no,
      transport: record.transport,
      destination: record.destination,
      weight: record.weight,
      rate: record.rate,
      total: record.total,
      bilty_charge: record.bilty_charge,
      freight_amount: record.freight_amount,
      advance: record.advance,
      advance_date: record.advance_date,
      commission: record.commission,
      bal_paid_amount: record.bal_paid_amount,
      bal_paid_date: record.bal_paid_date,
      net_amount: record.net_amount,
      is_bal_paid: record.is_bal_paid,
      date_of_reach: record.date_of_reach,
      date_of_unload: record.date_of_unload,
      day_in_hold: record.day_in_hold,
      holding_charge: record.holding_charge,
      total_holding_amount: record.total_holding_amount,
      courier_date: record.courier_date
    };
    setFormData(formRecord);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(id);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
      }
    }
  };

  // Show loading state
  if (recordsLoading || optionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading transport data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (recordsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{recordsError}</p>
          <p className="text-sm text-gray-500">
            Please make sure you have connected to Supabase by clicking the "Connect to Supabase" button in the top right.
          </p>
        </div>
      </div>
    );
  }

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate transport-wise outstanding amounts
  const getTransportOutstanding = () => {
    const transportData: { [key: string]: { outstanding: number; totalRecords: number; paidRecords: number } } = {};
    
    records.forEach(record => {
      if (record.transport && record.transport.trim()) {
        const transport = record.transport.trim();
        const netAmount = parseFloat(record.net_amount?.replace(/[^0-9.-]/g, '') || '0');
        const isPaid = record.is_bal_paid === 'YES';
        
        if (!transportData[transport]) {
          transportData[transport] = { outstanding: 0, totalRecords: 0, paidRecords: 0 };
        }
        
        transportData[transport].totalRecords += 1;
        if (isPaid) {
          transportData[transport].paidRecords += 1;
        } else {
          transportData[transport].outstanding += netAmount;
        }
      }
    });
    
    return Object.entries(transportData)
      .map(([transport, data]) => ({
        transport,
        outstanding: data.outstanding,
        totalRecords: data.totalRecords,
        paidRecords: data.paidRecords,
        pendingRecords: data.totalRecords - data.paidRecords
      }))
      .sort((a, b) => b.outstanding - a.outstanding);
  };

  const transportOutstanding = getTransportOutstanding();
  const totalOutstanding = transportOutstanding.reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-blue-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Transport Management System</h1>
                <p className="text-blue-200">Professional Data Entry Portal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Total Records</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Transports</p>
                <p className="text-2xl font-bold text-blue-600">{transportOutstanding.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {records.filter(r => r.is_bal_paid === 'NO').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.is_bal_paid === 'YES').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transport-wise Outstanding */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-red-600" />
              Transport-wise Outstanding Amounts
            </h2>
            <p className="text-gray-600 mt-1">Outstanding payments grouped by transport companies</p>
          </div>
          <div className="p-6">
            {transportOutstanding.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {transportOutstanding.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm">{item.transport}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.outstanding > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.outstanding > 0 ? 'Outstanding' : 'All Paid'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Outstanding Amount:</span>
                        <span className={`font-bold ${item.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{item.outstanding.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{item.totalRecords}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-medium text-yellow-600">{item.pendingRecords}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">{item.paidRecords}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Payment Progress</span>
                          <span>{Math.round((item.paidRecords / item.totalRecords) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(item.paidRecords / item.totalRecords) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transport data available</p>
                <p className="text-sm text-gray-400">Add some records to see transport-wise outstanding amounts</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsTruckFormOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Add Truck</span>
              </button>
              <button
                onClick={() => setIsTransportFormOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Add Transport</span>
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bilty No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.sr_no}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.bilty_no}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{record.truck_no}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.transport}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.destination}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{record.total}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.is_bal_paid === 'YES' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.is_bal_paid === 'YES' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingRecord ? 'Edit Record' : 'Add New Record'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SR No.</label>
                        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-semibold">
                          {editingRecord ? formData.sr_no : (records.length + 1)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Auto-generated based on total records</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bilty No.</label>
                        <input
                          type="text"
                          value={formData.bilty_no || ''}
                          onChange={(e) => handleInputChange('bilty_no', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Truck No.</label>
                        <input
                          type="text"
                          list="truck-list"
                          value={formData.truck_no || ''}
                          onChange={(e) => handleInputChange('truck_no', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="Select or type truck number"
                          required
                        />
                        <datalist id="truck-list">
                          {savedTrucks.map((truck, index) => (
                            <option key={index} value={truck} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  {/* Transport & Route Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Transport & Route
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
                        <input
                          type="text"
                          list="transport-list"
                          value={formData.transport || ''}
                          onChange={(e) => handleInputChange('transport', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Select or type transport company"
                          required
                        />
                        <datalist id="transport-list">
                          {savedTransports.map((transport, index) => (
                            <option key={index} value={transport} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <input
                          type="text"
                          value={formData.destination || ''}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        <input
                          type="text"
                          value={formData.weight || ''}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 27 MT G"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                        <input
                          type="text"
                          value={formData.rate || ''}
                          onChange={(e) => handleInputChange('rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., FIX+RTO or 1500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use "FIX" for fixed rates, or enter numeric value for calculation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Important Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMS Date</label>
                        <input
                          type="date"
                          value={formData.sms_date || ''}
                          onChange={(e) => handleInputChange('sms_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                        <input
                          type="date"
                          value={formData.lr_date || ''}
                          onChange={(e) => handleInputChange('lr_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Courier Date</label>
                        <input
                          type="date"
                          value={formData.courier_date || ''}
                          onChange={(e) => handleInputChange('courier_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount
                          {formData.rate && formData.rate.toLowerCase().includes('fix') && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.total || ''}
                          onChange={(e) => handleInputChange('total', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formData.rate && !formData.rate.toLowerCase().includes('fix') 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : ''
                          }`}
                          readOnly={formData.rate && !formData.rate.toLowerCase().includes('fix')}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.rate && formData.rate.toLowerCase().includes('fix') 
                            ? 'Enter total amount manually for fixed rates'
                            : 'Auto-calculated from weight × rate'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Freight Amount</label>
                        <input
                          type="text"
                          value={formData.freight_amount || ''}
                          onChange={(e) => handleInputChange('freight_amount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                        <input
                          type="text"
                          value={formData.commission || ''}
                          onChange={(e) => handleInputChange('commission', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                        <input
                          type="text"
                          value={formData.advance || ''}
                          onChange={(e) => handleInputChange('advance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
                        <input
                          type="text"
                          value={formData.net_amount || ''}
                          onChange={(e) => handleInputChange('net_amount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          value={formData.is_bal_paid || 'NO'}
                          onChange={(e) => handleInputChange('is_bal_paid', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="NO">Pending</option>
                          <option value="YES">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>{submitting ? 'Saving...' : (editingRecord ? 'Update Record' : 'Save Record')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Truck Modal */}
        {isTruckFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-6 h-6 mr-2 text-green-600" />
                    Add New Truck
                  </h2>
                  <button
                    onClick={() => setIsTruckFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddTruck}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      value={newTruckNo}
                      onChange={(e) => setNewTruckNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="e.g., GJ12BV6733"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsTruckFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Truck</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Transport Modal */}
        {isTransportFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <User className="w-6 h-6 mr-2 text-purple-600" />
                    Add New Transport
                  </h2>
                  <button
                    onClick={() => setIsTransportFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddTransport}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Company Name
                    </label>
                    <input
                      type="text"
                      value={newTransportName}
                      onChange={(e) => setNewTransportName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., RAKESH TRAILER"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsTransportFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Transport</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
      setNewTruckNo('');
      setIsTruckFormOpen(false);
    }
  };

  const handleAddTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransportName.trim() && !savedTransports.includes(newTransportName.trim())) {
      setSavedTransports(prev => [...prev, newTransportName.trim()]);
      setNewTransportName('');
      setIsTransportFormOpen(false);
    }
  };

  const handleEdit = (record: TransportRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate transport-wise outstanding amounts
  const getTransportOutstanding = () => {
    const transportData: { [key: string]: { outstanding: number; totalRecords: number; paidRecords: number } } = {};
    
    records.forEach(record => {
      if (record.transport && record.transport.trim()) {
        const transport = record.transport.trim();
        const netAmount = parseFloat(record.netAmount?.replace(/[^0-9.-]/g, '') || '0');
        const isPaid = record.isBalPaid === 'YES';
        
        if (!transportData[transport]) {
          transportData[transport] = { outstanding: 0, totalRecords: 0, paidRecords: 0 };
        }
        
        transportData[transport].totalRecords += 1;
        if (isPaid) {
          transportData[transport].paidRecords += 1;
        } else {
          transportData[transport].outstanding += netAmount;
        }
      }
    });
    
    return Object.entries(transportData)
      .map(([transport, data]) => ({
        transport,
        outstanding: data.outstanding,
        totalRecords: data.totalRecords,
        paidRecords: data.paidRecords,
        pendingRecords: data.totalRecords - data.paidRecords
      }))
      .sort((a, b) => b.outstanding - a.outstanding);
  };

  const transportOutstanding = getTransportOutstanding();
  const totalOutstanding = transportOutstanding.reduce((sum, item) => sum + item.outstanding, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-blue-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Transport Management System</h1>
                <p className="text-blue-200">Professional Data Entry Portal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Total Records</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Transports</p>
                <p className="text-2xl font-bold text-blue-600">{transportOutstanding.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {records.filter(r => r.isBalPaid === 'NO').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.isBalPaid === 'YES').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transport-wise Outstanding */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-red-600" />
              Transport-wise Outstanding Amounts
            </h2>
            <p className="text-gray-600 mt-1">Outstanding payments grouped by transport companies</p>
          </div>
          <div className="p-6">
            {transportOutstanding.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {transportOutstanding.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm">{item.transport}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.outstanding > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.outstanding > 0 ? 'Outstanding' : 'All Paid'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Outstanding Amount:</span>
                        <span className={`font-bold ${item.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{item.outstanding.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-medium">{item.totalRecords}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-medium text-yellow-600">{item.pendingRecords}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">{item.paidRecords}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Payment Progress</span>
                          <span>{Math.round((item.paidRecords / item.totalRecords) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(item.paidRecords / item.totalRecords) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transport data available</p>
                <p className="text-sm text-gray-400">Add some records to see transport-wise outstanding amounts</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsTruckFormOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Add Truck</span>
              </button>
              <button
                onClick={() => setIsTransportFormOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Add Transport</span>
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Record</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bilty No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.srNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.biltyNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{record.truckNo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.transport}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.destination}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{record.total}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.isBalPaid === 'YES' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.isBalPaid === 'YES' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingRecord ? 'Edit Record' : 'Add New Record'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SR No.</label>
                        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-semibold">
                          {editingRecord ? formData.srNo : (records.length + 1)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Auto-generated based on total records</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bilty No.</label>
                        <input
                          type="text"
                          value={formData.biltyNo || ''}
                          onChange={(e) => handleInputChange('biltyNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Truck No.</label>
                        <input
                          type="text"
                          list="truck-list"
                          value={formData.truckNo || ''}
                          onChange={(e) => handleInputChange('truckNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="Select or type truck number"
                          required
                        />
                        <datalist id="truck-list">
                          {savedTrucks.map((truck, index) => (
                            <option key={index} value={truck} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  {/* Transport & Route Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Transport & Route
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
                        <input
                          type="text"
                          list="transport-list"
                          value={formData.transport || ''}
                          onChange={(e) => handleInputChange('transport', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Select or type transport company"
                          required
                        />
                        <datalist id="transport-list">
                          {savedTransports.map((transport, index) => (
                            <option key={index} value={transport} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <input
                          type="text"
                          value={formData.destination || ''}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        <input
                          type="text"
                          value={formData.weight || ''}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 27 MT G"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                        <input
                          type="text"
                          value={formData.rate || ''}
                          onChange={(e) => handleInputChange('rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., FIX+RTO or 1500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use "FIX" for fixed rates, or enter numeric value for calculation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Important Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMS Date</label>
                        <input
                          type="date"
                          value={formData.smsDate || ''}
                          onChange={(e) => handleInputChange('smsDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                        <input
                          type="date"
                          value={formData.lrDate || ''}
                          onChange={(e) => handleInputChange('lrDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Courier Date</label>
                        <input
                          type="date"
                          value={formData.courierDate || ''}
                          onChange={(e) => handleInputChange('courierDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Financial Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount
                          {formData.rate && formData.rate.toLowerCase().includes('fix') && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.total || ''}
                          onChange={(e) => handleInputChange('total', e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            formData.rate && !formData.rate.toLowerCase().includes('fix') 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : ''
                          }`}
                          readOnly={formData.rate && !formData.rate.toLowerCase().includes('fix')}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.rate && formData.rate.toLowerCase().includes('fix') 
                            ? 'Enter total amount manually for fixed rates'
                            : 'Auto-calculated from weight × rate'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Freight Amount</label>
                        <input
                          type="text"
                          value={formData.freightAmount || ''}
                          onChange={(e) => handleInputChange('freightAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                        <input
                          type="text"
                          value={formData.commission || ''}
                          onChange={(e) => handleInputChange('commission', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                        <input
                          type="text"
                          value={formData.advance || ''}
                          onChange={(e) => handleInputChange('advance', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
                        <input
                          type="text"
                          value={formData.netAmount || ''}
                          onChange={(e) => handleInputChange('netAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                          value={formData.isBalPaid || 'NO'}
                          onChange={(e) => handleInputChange('isBalPaid', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="NO">Pending</option>
                          <option value="YES">Paid</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingRecord ? 'Update Record' : 'Save Record'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Truck Modal */}
        {isTruckFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <Truck className="w-6 h-6 mr-2 text-green-600" />
                    Add New Truck
                  </h2>
                  <button
                    onClick={() => setIsTruckFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddTruck}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      value={newTruckNo}
                      onChange={(e) => setNewTruckNo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="e.g., GJ12BV6733"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsTruckFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Truck</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Transport Modal */}
        {isTransportFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <User className="w-6 h-6 mr-2 text-purple-600" />
                    Add New Transport
                  </h2>
                  <button
                    onClick={() => setIsTransportFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddTransport}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport Company Name
                    </label>
                    <input
                      type="text"
                      value={newTransportName}
                      onChange={(e) => setNewTransportName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., RAKESH TRAILER"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsTransportFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Transport</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;