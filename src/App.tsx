import React, { useState } from 'react';
import { Truck, List, Plus, BarChart3 } from 'lucide-react';
import { TransportRecordForm } from './components/TransportRecordForm';
import { RecordsList } from './components/RecordsList';
import { Dashboard } from './components/Dashboard';

type ActiveTab = 'form' | 'records' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRecordAdded = () => {
    // Trigger refresh of records list
    setRefreshTrigger(prev => prev + 1);
    // Optionally switch to records tab to show the new record
    // setActiveTab('records');
  };

  const TabButton = ({ 
    tab, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    tab: ActiveTab; 
    icon: React.ComponentType<any>; 
    label: string; 
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                CHECKPOST CUSTOMER RECEIPT INTERFACE
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <TabButton
              tab="form"
              icon={Plus}
              label="ADD RECORD"
              isActive={activeTab === 'form'}
            />
            <TabButton
              tab="records"
              icon={List}
              label="VIEW RECORDS"
              isActive={activeTab === 'records'}
            />
            <TabButton
              tab="dashboard"
              icon={BarChart3}
              label="DASHBOARD"
              isActive={activeTab === 'dashboard'}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'form' && (
          <TransportRecordForm onRecordAdded={handleRecordAdded} />
        )}
        
        {activeTab === 'records' && (
          <RecordsList key={refreshTrigger} />
        )}
        
        {activeTab === 'dashboard' && (
          <Dashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 CHECKPOST CUSTOMER RECEIPT INTERFACE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;