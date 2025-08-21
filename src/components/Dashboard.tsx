import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  Calendar,
  PieChart,
  BarChart3,
  MapPin
} from 'lucide-react';
import { useTransportRecords } from '../hooks/useTransportRecords';

export function Dashboard() {
  const { records, loading } = useTransportRecords();

  const stats = useMemo(() => {
    if (!records.length) {
      return {
        totalRecords: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        uniqueTrucks: 0,
        uniqueTransports: 0,
        uniqueDestinations: 0,
        avgAmount: 0,
        paidPercentage: 0,
        recentRecords: []
      };
    }

    const totalRecords = records.length;
    const totalAmount = records.reduce((sum, record) => {
      const amount = parseFloat(record.total || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const paidRecords = records.filter(r => r.isbalpaid === 'YES');
    const unpaidRecords = records.filter(r => r.isbalpaid === 'NO');
    
    const paidAmount = paidRecords.reduce((sum, record) => {
      const amount = parseFloat(record.netamount || record.total || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const unpaidAmount = unpaidRecords.reduce((sum, record) => {
      const amount = parseFloat(record.netamount || record.total || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const uniqueTrucks = new Set(records.map(r => r.truckno).filter(Boolean)).size;
    const uniqueTransports = new Set(records.map(r => r.transport).filter(Boolean)).size;
    const uniqueDestinations = new Set(records.map(r => r.destination).filter(Boolean)).size;

    const avgAmount = totalAmount / totalRecords;
    const paidPercentage = totalRecords > 0 ? (paidRecords.length / totalRecords) * 100 : 0;

    const recentRecords = records.slice(0, 5);

    return {
      totalRecords,
      totalAmount,
      paidAmount,
      unpaidAmount,
      uniqueTrucks,
      uniqueTransports,
      uniqueDestinations,
      avgAmount,
      paidPercentage,
      recentRecords
    };
  }, [records]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ComponentType<any>; 
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 data-card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">LOADING DASHBOARD...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">DASHBOARD</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL RECORDS"
          value={stats.totalRecords}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="TOTAL AMOUNT"
          value={`₹${stats.totalAmount.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="UNIQUE TRUCKS"
          value={stats.uniqueTrucks}
          icon={Truck}
          color="bg-purple-500"
        />
        <StatCard
          title="DESTINATIONS"
          value={stats.uniqueDestinations}
          icon={MapPin}
          color="bg-orange-500"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="PAID AMOUNT"
          value={`₹${stats.paidAmount.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-green-600"
          subtitle={`${stats.paidPercentage.toFixed(1)}% OF TOTAL`}
        />
        <StatCard
          title="UNPAID AMOUNT"
          value={`₹${stats.unpaidAmount.toLocaleString()}`}
          icon={Calendar}
          color="bg-red-500"
          subtitle={`${(100 - stats.paidPercentage).toFixed(1)}% OF TOTAL`}
        />
        <StatCard
          title="AVERAGE AMOUNT"
          value={`₹${stats.avgAmount.toLocaleString()}`}
          icon={PieChart}
          color="bg-indigo-500"
          subtitle="PER RECORD"
        />
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">RECENT RECORDS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TRUCK NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TRANSPORT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DESTINATION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.truckno || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.transport || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.destination || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{record.total || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.isbalpaid === 'YES'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.isbalpaid === 'YES' ? 'PAID' : 'UNPAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {stats.recentRecords.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">NO RECORDS YET</h3>
            <p className="mt-1 text-sm text-gray-500">
              START BY ADDING YOUR FIRST TRANSPORT RECORD
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">PAYMENT STATUS</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">PAID RECORDS</span>
              <span className="text-sm font-medium text-green-600">
                {records.filter(r => r.isbalpaid === 'YES').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">UNPAID RECORDS</span>
              <span className="text-sm font-medium text-red-600">
                {records.filter(r => r.isbalpaid === 'NO').length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.paidPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">TRANSPORT OVERVIEW</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ACTIVE TRANSPORTS</span>
              <span className="text-sm font-medium text-blue-600">
                {stats.uniqueTransports}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ACTIVE TRUCKS</span>
              <span className="text-sm font-medium text-purple-600">
                {stats.uniqueTrucks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">DESTINATIONS</span>
              <span className="text-sm font-medium text-orange-600">
                {stats.uniqueDestinations}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}