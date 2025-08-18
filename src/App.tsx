import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Save, X, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { useTransportRecords } from './hooks/useTransportRecords';
import { useSavedOptions } from './hooks/useSavedOptions';

interface TransportRecord {
  id: string;
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

const App: React.FC = () => {
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransportFormOpen, setIsTransportFormOpen] = useState(false);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [isDestinationFormOpen, setIsDestinationFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TransportRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<TransportRecord>>({});
  const [newTransport, setNewTransport] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [vehicleError, setVehicleError] = useState('');
  const [savedDestinations, setSavedDestinations] = useState<string[]>([]);

  const resetForm = () => {
    setFormData({});
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const resetTransportForm = () => {
    setNewTransport('');
    setIsTransportFormOpen(false);
  };

  const resetVehicleForm = () => {
    setNewVehicle('');
    setVehicleError('');
    setIsVehicleFormOpen(false);
  };

  const resetDestinationForm = () => {
    setNewDestination('');
    setIsDestinationFormOpen(false);
  };

  const handleAddTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransport.trim()) {
      try {
        await addTransport(newTransport.trim());
        resetTransportForm();
      } catch (error) {
        console.error('Error adding transport:', error);
      }
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleError('');
    
    if (newVehicle.trim()) {
      try {
        await addTruck(newVehicle.trim());
        resetVehicleForm();
      } catch (error) {
        console.error('Error adding vehicle:', error);
        
        // Check if it's a duplicate key error
        if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
          setVehicleError('Vehicle with this number already exists.');
        } else {
          setVehicleError('Failed to add vehicle. Please try again.');
        }
      }
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDestination.trim()) {
      try {
        // Add to local state for now - you can extend this to save to database
        setSavedDestinations(prev => [...new Set([...prev, newDestination.trim()])].sort());
        resetDestinationForm();
      } catch (error) {
        console.error('Error adding destination:', error);
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, formData);
      } else {
        await addRecord(formData);
      }
      
      // Save truck and transport if they're new
      if (formData.truckno && !savedTrucks.includes(formData.truckno)) {
        await addTruck(formData.truckno);
      }
      if (formData.transport && !savedTransports.includes(formData.transport)) {
        await addTransport(formData.transport);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleEdit = (record: TransportRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate total amount based on rate type
  useEffect(() => {
    const weight = parseFloat(formData.weight?.replace(/[^\d.]/g, '') || '0');
    const rateText = formData.rate || '';
    
    if (rateText.toLowerCase().includes('fix')) {
      // For fixed rates, don't auto-calculate
      return;
    }
    
    const rate = parseFloat(rateText.replace(/[^\d.]/g, '') || '0');
    
    if (weight > 0 && rate > 0) {
      const calculatedTotal = (weight * rate).toString();
      setFormData(prev => ({ ...prev, total: calculatedTotal }));
    }
  }, [formData.weight, formData.rate]);

  // Calculate dashboard statistics
  const totalOutstanding = records
    .filter(record => record.isbalpaid?.toLowerCase() !== 'yes')
    .reduce((sum, record) => {
      const netAmount = parseFloat(record.netamount?.replace(/[^\d.]/g, '') || '0');
      const balPaid = parseFloat(record.balpaidamount?.replace(/[^\d.]/g, '') || '0');
      return sum + (netAmount - balPaid);
    }, 0);

  const activeTransports = new Set(records.map(r => r.transport).filter(Boolean)).size;
  const pendingPayments = records.filter(record => record.isbalpaid?.toLowerCase() !== 'yes').length;
  const completedPayments = records.filter(record => record.isbalpaid?.toLowerCase() === 'yes').length;

  // Calculate transport-wise outstanding
  useEffect(() => {
    const destinations = [...new Set(records.map(r => r.destination).filter(Boolean))];
    setSavedDestinations(prev => [...new Set([...prev, ...destinations])].sort());
  }, [records]);

  const transportOutstanding = records.reduce((acc, record) => {
    if (!record.transport) return acc;
    
    if (!acc[record.transport]) {
      acc[record.transport] = {
        outstanding: 0,
        totalRecords: 0,
        pendingRecords: 0,
        paidRecords: 0
      };
    }
    
    acc[record.transport].totalRecords++;
    
    if (record.isbalpaid?.toLowerCase() === 'yes') {
      acc[record.transport].paidRecords++;
    } else {
      acc[record.transport].pendingRecords++;
      const netAmount = parseFloat(record.netamount?.replace(/[^\d.]/g, '') || '0');
      const balPaid = parseFloat(record.balpaidamount?.replace(/[^\d.]/g, '') || '0');
      acc[record.transport].outstanding += (netAmount - balPaid);
    }
    
    return acc;
  }, {} as Record<string, { outstanding: number; totalRecords: number; pendingRecords: number; paidRecords: number }>);

  const sortedTransports = Object.entries(transportOutstanding)
    .sort(([, a], [, b]) => b.outstanding - a.outstanding);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transport records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading data</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isFixedRate = formData.rate?.toLowerCase().includes('fix');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsTransportFormOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Transport</span>
              </button>
              <button
                onClick={() => {
                  setVehicleError('');
                  setIsVehicleFormOpen(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Vehicle</span>
              </button>
              <button
                onClick={() => setIsDestinationFormOpen(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Destination</span>
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Record</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Transports</p>
                <p className="text-2xl font-bold text-blue-600">{activeTransports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{pendingPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transport-wise Outstanding */}
        {sortedTransports.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transport-wise Outstanding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTransports.map(([transport, data]) => (
                <div key={transport} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 truncate">{transport}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.outstanding > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {data.outstanding > 0 ? 'Outstanding' : 'All Paid'}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold mb-2 ${
                    data.outstanding > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(data.outstanding)}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Total Records: {data.totalRecords}</p>
                    <p>Pending: {data.pendingRecords} | Paid: {data.paidRecords}</p>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.paidRecords / data.totalRecords) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((data.paidRecords / data.totalRecords) * 100)}% completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bilty No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.srno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.biltyno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.truckno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.transport}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.rate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.netamount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.isbalpaid?.toLowerCase() === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.isbalpaid?.toLowerCase() === 'yes' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRecord ? 'Edit Record' : 'Add New Record'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sr No</label>
                    <input
                      type="text"
                      value={formData.srno || ''}
                      onChange={(e) => setFormData({...formData, srno: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMS Date</label>
                    <input
                      type="text"
                      value={formData.smsdate || ''}
                      onChange={(e) => setFormData({...formData, smsdate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                    <input
                      type="text"
                      value={formData.lrdate || ''}
                      onChange={(e) => setFormData({...formData, lrdate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bilty No</label>
                    <input
                      type="text"
                      value={formData.biltyno || ''}
                      onChange={(e) => setFormData({...formData, biltyno: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Truck No</label>
                    <input
                      type="text"
                      list="trucks"
                      value={formData.truckno || ''}
                      onChange={(e) => setFormData({...formData, truckno: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="trucks">
                      {savedTrucks.map(truck => (
                        <option key={truck} value={truck} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
                    <input
                      type="text"
                      list="transports"
                      value={formData.transport || ''}
                      onChange={(e) => setFormData({...formData, transport: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="transports">
                      {savedTransports.map(transport => (
                        <option key={transport} value={transport} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <input
                      type="text"
                      list="destinations"
                      value={formData.destination || ''}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="destinations">
                      {savedDestinations.map(destination => (
                        <option key={destination} value={destination} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="text"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="e.g., 27 MT G"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="text"
                      value={formData.rate || ''}
                      onChange={(e) => setFormData({...formData, rate: e.target.value})}
                      placeholder="e.g., 1500 or FIX+RTO"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use "FIX" for fixed rates, or enter numeric rate for calculation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount {isFixedRate && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.total || ''}
                      onChange={(e) => setFormData({...formData, total: e.target.value})}
                      readOnly={!isFixedRate}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isFixedRate ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isFixedRate ? 'Enter total amount manually' : 'Auto-calculated: Weight × Rate'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bilty Charge</label>
                    <input
                      type="text"
                      value={formData.biltycharge || ''}
                      onChange={(e) => setFormData({...formData, biltycharge: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Freight Amount</label>
                    <input
                      type="text"
                      value={formData.freightamount || ''}
                      onChange={(e) => setFormData({...formData, freightamount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                    <input
                      type="text"
                      value={formData.advance || ''}
                      onChange={(e) => setFormData({...formData, advance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance Date</label>
                    <input
                      type="text"
                      value={formData.advancedate || ''}
                      onChange={(e) => setFormData({...formData, advancedate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                    <input
                      type="text"
                      value={formData.commission || ''}
                      onChange={(e) => setFormData({...formData, commission: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance Paid Amount</label>
                    <input
                      type="text"
                      value={formData.balpaidamount || ''}
                      onChange={(e) => setFormData({...formData, balpaidamount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Balance Paid Date</label>
                    <input
                      type="text"
                      value={formData.balpaiddate || ''}
                      onChange={(e) => setFormData({...formData, balpaiddate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
                    <input
                      type="text"
                      value={formData.netamount || ''}
                      onChange={(e) => setFormData({...formData, netamount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Is Balance Paid</label>
                    <select
                      value={formData.isbalpaid || ''}
                      onChange={(e) => setFormData({...formData, isbalpaid: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Reach</label>
                    <input
                      type="text"
                      value={formData.dateofreach || ''}
                      onChange={(e) => setFormData({...formData, dateofreach: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Unload</label>
                    <input
                      type="text"
                      value={formData.dateofunload || ''}
                      onChange={(e) => setFormData({...formData, dateofunload: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day in Hold</label>
                    <input
                      type="text"
                      value={formData.dayinhold || ''}
                      onChange={(e) => setFormData({...formData, dayinhold: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Holding Charge</label>
                    <input
                      type="text"
                      value={formData.holdingcharge || ''}
                      onChange={(e) => setFormData({...formData, holdingcharge: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Holding Amount</label>
                    <input
                      type="text"
                      value={formData.totalholdingamount || ''}
                      onChange={(e) => setFormData({...formData, totalholdingamount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Courier Date</label>
                    <input
                      type="text"
                      value={formData.courierdate || ''}
                      onChange={(e) => setFormData({...formData, courierdate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingRecord ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transport Form Modal */}
      {isTransportFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Transport Company</h2>
                <button
                  onClick={resetTransportForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddTransport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Company Name
                  </label>
                  <input
                    type="text"
                    value={newTransport}
                    onChange={(e) => setNewTransport(e.target.value)}
                    placeholder="e.g., SHARMA RAJESH ROADWAYS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetTransportForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Add Transport</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Form Modal */}
      {isVehicleFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
                <button
                  onClick={resetVehicleForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle/Truck Number
                  </label>
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    placeholder="e.g., GJ12BV6733"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {vehicleError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {vehicleError}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVehicleForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Add Vehicle</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Destination Form Modal */}
      {isDestinationFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Destination</h2>
                <button
                  onClick={resetDestinationForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddDestination} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Name
                  </label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g., BAGODARA - LAKHPAT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetDestinationForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Add Destination</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;