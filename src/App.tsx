import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Edit, Trash2, Download, Upload, Calculator, Receipt, Minus } from 'lucide-react';
import { useTransportRecords } from './hooks/useTransportRecords';
import { useSavedOptions } from './hooks/useSavedOptions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

interface PaymentDeduction {
  id: string;
  amount: string;
  reason: string;
  date: string;
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

export default function App() {
  const { records, loading, error, addRecord, updateRecord, deleteRecord } = useTransportRecords();
  const { savedTrucks, savedTransports, addTruck, addTransport } = useSavedOptions();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentDeductions, setPaymentDeductions] = useState<PaymentDeduction[]>([]);
  const [showDeductionForm, setShowDeductionForm] = useState(false);
  const [newDeduction, setNewDeduction] = useState({
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Auto-calculate net amount when relevant fields change
  useEffect(() => {
    const total = parseFloat(formData.total) || 0;
    const advance = parseFloat(formData.advance) || 0;
    const commission = parseFloat(formData.commission) || 0;
    const balpaidamount = parseFloat(formData.balpaidamount) || 0;
    const totalholdingamount = parseFloat(formData.totalholdingamount) || 0;
    
    // Calculate total deductions
    const totalDeductions = paymentDeductions.reduce((sum, deduction) => 
      sum + (parseFloat(deduction.amount) || 0), 0
    );
    
    const netAmount = total - advance - commission - balpaidamount - totalholdingamount - totalDeductions;
    
    setFormData(prev => ({
      ...prev,
      netamount: netAmount.toFixed(2)
    }));
  }, [formData.total, formData.advance, formData.commission, formData.balpaidamount, formData.totalholdingamount, paymentDeductions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const recordData = {
        ...formData,
        // Store deductions as JSON string
        extra_deductions: JSON.stringify(paymentDeductions)
      };

      if (editingId) {
        await updateRecord(editingId, recordData);
        setEditingId(null);
      } else {
        await addRecord(recordData);
      }
      
      setFormData(initialFormData);
      setPaymentDeductions([]);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving record:', err);
    }
  };

  const handleEdit = (record: any) => {
    setFormData({
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
    
    // Load existing deductions
    try {
      const deductions = record.extra_deductions ? JSON.parse(record.extra_deductions) : [];
      setPaymentDeductions(deductions);
    } catch {
      setPaymentDeductions([]);
    }
    
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteRecord(id);
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  const addDeduction = () => {
    if (newDeduction.amount && newDeduction.reason) {
      const deduction: PaymentDeduction = {
        id: Date.now().toString(),
        ...newDeduction
      };
      setPaymentDeductions(prev => [...prev, deduction]);
      setNewDeduction({
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowDeductionForm(false);
    }
  };

  const removeDeduction = (id: string) => {
    setPaymentDeductions(prev => prev.filter(d => d.id !== id));
  };

  const filteredRecords = records.filter(record =>
    Object.values(record).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const generateReceipt = (record: any) => {
    setSelectedRecord(record);
    setShowReceipt(true);
  };

  const downloadReceipt = async () => {
    const element = document.getElementById('receipt-content');
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`receipt-${selectedRecord?.biltyno || 'transport'}.pdf`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading transport records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Transport Management System</h1>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setFormData(initialFormData);
                setPaymentDeductions([]);
                setEditingId(null);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Record
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bilty No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{record.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{record.netamount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.isbalpaid === 'YES' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.isbalpaid === 'YES' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateReceipt(record)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Record' : 'Add New Record'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData(initialFormData);
                    setPaymentDeductions([]);
                    setEditingId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="form-section">
                  <h3><Calculator className="w-5 h-5 mr-2" />Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SR No.</label>
                      <input
                        type="text"
                        name="srno"
                        value={formData.srno}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMS Date</label>
                      <input
                        type="date"
                        name="smsdate"
                        value={formData.smsdate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                      <input
                        type="date"
                        name="lrdate"
                        value={formData.lrdate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bilty No.</label>
                      <input
                        type="text"
                        name="biltyno"
                        value={formData.biltyno}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Truck No.</label>
                      <input
                        type="text"
                        name="truckno"
                        value={formData.truckno}
                        onChange={handleInputChange}
                        list="trucks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
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
                        name="transport"
                        value={formData.transport}
                        onChange={handleInputChange}
                        list="transports"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <datalist id="transports">
                        {savedTransports.map(transport => (
                          <option key={transport} value={transport} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Transport Details */}
                <div className="form-section">
                  <h3><Truck className="w-5 h-5 mr-2" />Transport Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                      <input
                        type="text"
                        name="rate"
                        value={formData.rate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="form-section">
                  <h3><Calculator className="w-5 h-5 mr-2" />Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        name="total"
                        value={formData.total}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                      <input
                        type="number"
                        step="0.01"
                        name="advance"
                        value={formData.advance}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advance Date</label>
                      <input
                        type="date"
                        name="advancedate"
                        value={formData.advancedate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                      <input
                        type="number"
                        step="0.01"
                        name="commission"
                        value={formData.commission}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balance Paid Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        name="balpaidamount"
                        value={formData.balpaidamount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balance Paid Date</label>
                      <input
                        type="date"
                        name="balpaiddate"
                        value={formData.balpaiddate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Deductions Section */}
                <div className="form-section">
                  <div className="flex justify-between items-center mb-4">
                    <h3><Minus className="w-5 h-5 mr-2" />Payment Deductions</h3>
                    <button
                      type="button"
                      onClick={() => setShowDeductionForm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Deduction
                    </button>
                  </div>
                  
                  {paymentDeductions.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {paymentDeductions.map((deduction) => (
                        <div key={deduction.id} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium text-red-800">₹{deduction.amount}</span>
                              <span className="text-gray-600">{deduction.reason}</span>
                              <span className="text-sm text-gray-500">{deduction.date}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDeduction(deduction.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="text-right">
                        <span className="text-sm font-medium text-red-600">
                          Total Deductions: ₹{paymentDeductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {showDeductionForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newDeduction.amount}
                            onChange={(e) => setNewDeduction(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter deduction amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                          <input
                            type="text"
                            value={newDeduction.reason}
                            onChange={(e) => setNewDeduction(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Reason for deduction"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            value={newDeduction.date}
                            onChange={(e) => setNewDeduction(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowDeductionForm(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={addDeduction}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          Add Deduction
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Details */}
                <div className="form-section">
                  <h3>Other Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        name="netamount"
                        value={formData.netamount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                      <select
                        name="isbalpaid"
                        value={formData.isbalpaid}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NO">Pending</option>
                        <option value="YES">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Courier Date</label>
                      <input
                        type="date"
                        name="courierdate"
                        value={formData.courierdate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData(initialFormData);
                      setPaymentDeductions([]);
                      setEditingId(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingId ? 'Update Record' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transport Receipt</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadReceipt}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowReceipt(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div id="receipt-content" className="bg-white p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Transport Receipt</h1>
                  <p className="text-gray-600">Bilty No: {selectedRecord.biltyno}</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Truck No:</span> {selectedRecord.truckno}</p>
                      <p><span className="font-medium">Transport:</span> {selectedRecord.transport}</p>
                      <p><span className="font-medium">Destination:</span> {selectedRecord.destination}</p>
                      <p><span className="font-medium">Weight:</span> {selectedRecord.weight}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Total Amount:</span> ₹{selectedRecord.total}</p>
                      <p><span className="font-medium">Advance:</span> ₹{selectedRecord.advance}</p>
                      <p><span className="font-medium">Commission:</span> ₹{selectedRecord.commission}</p>
                      <p><span className="font-medium">Net Amount:</span> ₹{selectedRecord.netamount}</p>
                    </div>
                  </div>
                </div>

                {/* Show deductions if any */}
                {selectedRecord.extra_deductions && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Deductions</h3>
                    <div className="bg-red-50 p-4 rounded-lg">
                      {JSON.parse(selectedRecord.extra_deductions).map((deduction: PaymentDeduction, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span>{deduction.reason}</span>
                          <span className="font-medium text-red-600">-₹{deduction.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRecord.isbalpaid === 'YES' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRecord.isbalpaid === 'YES' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}