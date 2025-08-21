import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Download, Eye, Filter, Calendar, Truck } from 'lucide-react';
import { useTransportRecords } from '../hooks/useTransportRecords';
import { RecordDetailsModal } from './RecordDetailsModal';
import { EditRecordModal } from './EditRecordModal';
import { ExportUtils } from '../utils/exportUtils';
import type { Database } from '../lib/supabase';

type TransportRecord = Database['public']['Tables']['transport_records']['Row'];

export function RecordsList() {
  const { records, loading, error, deleteRecord } = useTransportRecords();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<TransportRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<TransportRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Filter records based on search term, status, and date
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.truckno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.transport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.biltyno?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'paid' && record.isbalpaid === 'YES') ||
      (filterStatus === 'unpaid' && record.isbalpaid === 'NO');

    const matchesDate = 
      !dateFilter || 
      record.lrdate?.includes(dateFilter) ||
      record.smsdate?.includes(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (record: TransportRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleEditRecord = (record: TransportRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('ARE YOU SURE YOU WANT TO DELETE THIS RECORD?')) {
      try {
        await deleteRecord(id);
        alert('RECORD DELETED SUCCESSFULLY!');
      } catch (error) {
        alert('FAILED TO DELETE RECORD. PLEASE TRY AGAIN.');
      }
    }
  };

  const handleExportRecords = () => {
    ExportUtils.exportToCSV(filteredRecords, 'transport_records');
  };

  const getStatusBadge = (isPaid: string | null) => {
    const status = isPaid === 'YES';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium status-badge ${
        status 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status ? 'PAID' : 'UNPAID'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">LOADING RECORDS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600">
            <h3 className="text-lg font-medium">ERROR LOADING RECORDS</h3>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Truck className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">TRANSPORT RECORDS</h2>
          <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredRecords.length} RECORDS
          </span>
        </div>
        <button
          onClick={handleExportRecords}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH RECORDS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">ALL STATUS</option>
            <option value="paid">PAID</option>
            <option value="unpaid">UNPAID</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setDateFilter('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            CLEAR FILTERS
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-container">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TRUCK & TRANSPORT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DESTINATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BILTY NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.truckno || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.transport || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.destination || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.biltyno || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{record.total || '0'}
                    </div>
                    <div className="text-sm text-gray-500">
                      NET: ₹{record.netamount || '0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.isbalpaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.lrdate || record.smsdate || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="VIEW DETAILS"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="EDIT RECORD"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="DELETE RECORD"
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

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">NO RECORDS FOUND</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || dateFilter
                ? 'TRY ADJUSTING YOUR FILTERS'
                : 'GET STARTED BY ADDING A NEW TRANSPORT RECORD'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRecord(null);
          }}
        />
      )}

      {showEditModal && editingRecord && (
        <EditRecordModal
          record={editingRecord}
          onClose={() => {
            setShowEditModal(false);
            setEditingRecord(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}