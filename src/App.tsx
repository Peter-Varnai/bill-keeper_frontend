import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ExpensesTable } from './components/ExpensesTable';
import { BillsView } from './components/BillsView';
import { DashboardView } from './components/DashboardView';
import { ApplicationBreakdownPanel } from './components/ApplicationBreakdownPanel';
import { DataGroupSelector } from './components/DataGroupSelector';
import { AddExpenseModal } from './components/AddExpenseModal';
import { UploadBillsModal } from './components/UploadBillsModal';
import { Dialog } from './components/windows98';
import { useDataGroups, useCreateDataGroup, useDeleteDataGroup } from './hooks/useDataGroups';
import { Protected } from './auth/Protected';
import { useAuth } from './auth/AuthContext';
import '98.css';
import './styles/overrides.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = 'expenses' | 'bills' | 'dashboard';

const LAST_USED_DATA_GROUP_KEY = 'lastUsedDataGroupId';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [error, setError] = useState<string | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showUploadBillsModal, setShowUploadBillsModal] = useState(false);
  const { logout } = useAuth();
  
  // Load last used data group from localStorage, default to null
  const [selectedDataGroup, setSelectedDataGroup] = useState<number | null>(() => {
    const saved = localStorage.getItem(LAST_USED_DATA_GROUP_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  const { data: groups, isLoading: isLoadingGroups } = useDataGroups();
  const createGroupMutation = useCreateDataGroup();
  const deleteGroupMutation = useDeleteDataGroup();
  const queryClient = useQueryClient();

  // Persist selected data group to localStorage whenever it changes
  useEffect(() => {
    if (selectedDataGroup !== null) {
      localStorage.setItem(LAST_USED_DATA_GROUP_KEY, selectedDataGroup.toString());
    }
  }, [selectedDataGroup]);

  // Handle initial selection when groups load
  useEffect(() => {
    if (groups && groups.length > 0) {
      // If we have a saved selection, check if it still exists
      if (selectedDataGroup !== null) {
        const stillExists = groups.some(g => g.id === selectedDataGroup);
        if (!stillExists) {
          // Saved group no longer exists, clear it and use first available
          setSelectedDataGroup(groups[0].id);
        }
      } else {
        // No saved selection, use first group
        setSelectedDataGroup(groups[0].id);
      }
    }
  }, [groups]);

  const handleAddGroup = (name: string, group_type: 'project' | 'organization') => {
    createGroupMutation.mutate(
      { name, group_type },
      {
        onSuccess: (newGroup) => {
          // Automatically select the newly created group
          setSelectedDataGroup(newGroup.id);
        },
        onError: (err) => {
          setError(`Failed to create group: ${err.message}`);
        },
      }
    );
  };

  const handleDeleteGroup = (groupId: number) => {
    deleteGroupMutation.mutate(groupId, {
      onSuccess: () => {
        // Invalidate and refetch to update the groups list
        queryClient.invalidateQueries({ queryKey: ['data_groups'] });
      },
      onError: (err) => {
        setError(`Failed to delete group: ${err.message}`);
      },
    });
  };

  const renderTabBar = () => (
    <div style={{ 
      display: 'flex', 
      gap: '4px', 
      marginBottom: '8px',
      backgroundColor: '#c0c0c0',
      padding: '4px',
      border: '2px outset #fff'
    }}>
      {/* Data Group Selector */}
      {groups && groups.length > 0 && (
        <DataGroupSelector
          groups={groups}
          selectedDataGroup={selectedDataGroup || groups[0].id}
          onSelectDataGroup={setSelectedDataGroup}
          onAddGroup={handleAddGroup}
          onDeleteGroup={handleDeleteGroup}
          isLoading={isLoadingGroups || createGroupMutation.isPending || deleteGroupMutation.isPending}
        />
      )}
      
      {(['expenses', 'bills', 'dashboard'] as Tab[]).map((tab) => (
        <React.Fragment key={tab}>
          {tab === 'expenses' && selectedDataGroup && (
            <button
              onClick={() => setShowAddExpenseModal(true)}
              disabled={isLoadingGroups}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                cursor: isLoadingGroups ? 'not-allowed' : 'pointer',
                minWidth: '32px',
                height: '100%',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px inset #808080';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
              }}
              title="Add new expense"
            >
              +
            </button>
          )}
          {tab === 'bills' && selectedDataGroup && (
            <button
              onClick={() => setShowUploadBillsModal(true)}
              disabled={isLoadingGroups}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                cursor: isLoadingGroups ? 'not-allowed' : 'pointer',
                minWidth: '32px',
                height: '100%',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px inset #808080';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px outset #fff';
              }}
              title="Upload bills"
            >
              +
            </button>
          )}
          <button
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 24px',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              backgroundColor: activeTab === tab ? '#d4d0c8' : '#c0c0c0',
              border: activeTab === tab ? '2px inset #808080' : '2px outset #fff',
              cursor: 'pointer',
              textTransform: 'capitalize',
              minWidth: '120px',
            }}
          >
            {tab}
          </button>
        </React.Fragment>
      ))}
      <div style={{ flex: 1 }} />
      <button
        onClick={logout}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          backgroundColor: '#c0c0c0',
          border: '2px outset #fff',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );

  const renderTabContent = () => {
    // If no data group selected yet, return empty
    if (!selectedDataGroup) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          backgroundColor: '#c0c0c0',
          border: '2px outset #fff'
        }}>
          <p>No data group selected. Please select or create a data group from the dropdown above.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'expenses':
        return (
          <div style={{ display: 'flex', gap: '8px', height: 'calc(100vh - 80px)' }}>
            <div style={{ flex: 3 }}>
              <ExpensesTable dataGroupId={selectedDataGroup} />
            </div>
            <div style={{ flex: 1 }}>
              <ApplicationBreakdownPanel dataGroupId={selectedDataGroup} />
            </div>
          </div>
        );
      case 'bills':
        return <BillsView dataGroupId={selectedDataGroup} />;
      case 'dashboard':
        return (
          <DashboardView 
            dataGroupId={selectedDataGroup} 
          />
        );
      default:
        return null;
    }
  };



  return (
    <div style={{ padding: '8px', backgroundColor: '#008080', minHeight: '100vh' }}>
      {renderTabBar()}
      {renderTabContent()}

      <Dialog
        title="Error"
        message={error || ''}
        isOpen={!!error}
        onClose={() => setError(null)}
        type="error"
      />
      
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        dataGroupId={selectedDataGroup || 0}
        onSuccess={() => {
          setShowAddExpenseModal(false);
        }}
      />
      
      <UploadBillsModal
        isOpen={showUploadBillsModal}
        onClose={() => setShowUploadBillsModal(false)}
        dataGroupId={selectedDataGroup || 0}
        onSuccess={() => {
          // Bills list automatically refreshes via React Query cache invalidation
          setShowUploadBillsModal(false);
        }}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Protected>
        <AppContent />
      </Protected>
    </QueryClientProvider>
  );
};

export default App;