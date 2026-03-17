import React, { useState } from 'react';
import { useBills, useDeleteBill } from '../hooks/useBills';
import { Window, Button, Dialog } from './windows98';
import { Tooltip } from './Tooltip';
import { getImageUrl } from '../api/client';
import type { Bill } from '../api/types';

interface BillsListProps {
  onEditBill?: (bill: Bill) => void;
  dataGroupId: number;
}

export const BillsList: React.FC<BillsListProps> = ({ onEditBill, dataGroupId }) => {
  const { data: bills, isLoading, error } = useBills(dataGroupId);
  const deleteBill = useDeleteBill(dataGroupId);
  
  // State for delete confirmation dialog
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);

  if (isLoading) {
    return (
      <Window title="Bills" style={{ margin: '8px' }}>
        <div style={{ padding: '16px' }}>Loading bills...</div>
      </Window>
    );
  }

  if (error) {
    return (
      <Window title="Bills" style={{ margin: '8px' }}>
        <div style={{ padding: '16px', color: 'red' }}>
          Error loading bills: {error.message}
        </div>
      </Window>
    );
  }
  
  const handleDeleteClick = (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation(); // Prevent any parent click handlers
    setBillToDelete(bill);
  };
  
  const handleConfirmDelete = () => {
    if (billToDelete) {
      deleteBill.mutate({ id: billToDelete.id });
      setBillToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setBillToDelete(null);
  };

  return (
    <Window title="Bills" style={{ margin: '8px', height: '90vh' }}>
      <div style={{ 
        padding: '8px', 
        overflow: 'auto', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {bills?.map((bill) => (
          <div
            key={bill.id}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '8px',
              backgroundColor: '#c0c0c0',
              border: '2px outset #fff',
              alignItems: 'center',
            }}
          >
            {/* Image Section */}
            <div style={{ flexShrink: 0 }}>
              {bill.filename ? (
                <img
                  src={getImageUrl(bill.filename, dataGroupId)}
                  alt={`Bill ${bill.id}`}
                  style={{ 
                    maxWidth: '80px', 
                    maxHeight: '80px',
                    border: '1px solid #808080',
                    backgroundColor: '#fff'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#e0e0e0',
                    border: '1px solid #808080',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#666',
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            {/* Info Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                Bill #{bill.id}
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span>
                  <strong>Amount:</strong>{' '}
                  {bill.amount !== null && bill.amount !== undefined
                    ? `€ ${bill.amount.toFixed(2)}`
                    : '-'}
                </span>
                <span>
                  <strong>Date:</strong> {bill.date || '-'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {bill.filename || 'No filename'}
              </div>
            </div>

            {/* Action Section */}
            <div style={{ flexShrink: 0, display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Tooltip text={`Edit bill #${bill.id} details`}>
                <Button onClick={() => onEditBill?.(bill)}>Edit</Button>
              </Tooltip>
              <Tooltip text={`Delete bill #${bill.id}`}>
                <button
                  onClick={(e) => handleDeleteClick(e, bill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                  }}
                >
                  🗑️
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      <Dialog
        title="Delete Scanned Bill"
        message="Are you sure you want to delete this scanned bill? The bill number will be cleared from any linked expenses."
        isOpen={!!billToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        type="warning"
      />
    </Window>
  );
};
