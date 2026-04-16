import React, { useState } from 'react';
import { Dialog } from './windows98';
import { useCreateApplicationReport, useUpdateApplicationReport, useDeleteApplicationReport } from '../hooks/useApplicationReports';
import type { ApplicationReport } from '../api/types';

interface ApplicationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppReport: ApplicationReport | null;
  dataGroupId: number;
}

export const ApplicationReportModal: React.FC<ApplicationReportModalProps> = ({
  isOpen,
  onClose,
  editingAppReport,
  dataGroupId,
}) => {
  const createAppReport = useCreateApplicationReport();
  const updateAppReport = useUpdateApplicationReport();
  const deleteAppReport = useDeleteApplicationReport();

  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (editingAppReport) {
        setEditName(editingAppReport.name);
        setEditAmount(editingAppReport.amount.toString());
        setEditDeadline(editingAppReport.submission_deadline || '');
      } else {
        setEditName('');
        setEditAmount('');
        setEditDeadline('');
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, editingAppReport]);

  const handleSave = () => {
    const amount = parseFloat(editAmount) || 0;
    
    const closeModal = () => {
      onClose();
    };

    if (editingAppReport) {
      updateAppReport.mutate({
        id: editingAppReport.id,
        data: {
          name: editName,
          amount: amount,
          submission_deadline: editDeadline || null,
        },
      }, {
        onSettled: closeModal,
      });
    } else {
      createAppReport.mutate({
        name: editName,
        amount: amount,
        submission_deadline: editDeadline || undefined,
        data_group: dataGroupId,
      }, {
        onSettled: closeModal,
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (editingAppReport) {
      deleteAppReport.mutate({ id: editingAppReport.id }, {
        onSettled: () => {
          setShowDeleteConfirm(false);
          onClose();
        },
      });
    } else {
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}
        onClick={onClose}
      >
        <div
          className="window"
          style={{
            minWidth: '350px',
            backgroundColor: '#c0c0c0',
            border: '2px outset #fff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="title-bar"
            style={{
              backgroundColor: '#000080',
              color: 'white',
              padding: '4px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className="title-bar-text" style={{ fontWeight: 'bold' }}>
              {editingAppReport ? 'Edit Application Report' : 'New Application Report'}
            </div>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
                padding: '2px 8px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          <div className="window-body" style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Name:
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., BMKOS, MA7, Bezirk"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  border: '2px inset #c0c0c0',
                  height: '28px',
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Target Amount (€):
              </label>
              <input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="e.g., 27000"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  border: '2px inset #c0c0c0',
                  height: '28px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
                Submission Deadline (optional):
              </label>
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  border: '2px inset #c0c0c0',
                  height: '28px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  backgroundColor: '#c0c0c0',
                  border: '2px outset #fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              {editingAppReport && (
                <button
                  onClick={handleDeleteClick}
                  style={{
                    padding: '6px 16px',
                    fontSize: '12px',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                    cursor: 'pointer',
                    color: '#d32f2f',
                  }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!editName.trim()}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  backgroundColor: '#c0c0c0',
                  border: '2px outset #fff',
                  cursor: editName.trim() ? 'pointer' : 'not-allowed',
                  opacity: editName.trim() ? 1 : 0.6,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        title="Delete Application Report"
        message={editingAppReport
          ? `Are you sure you want to delete "${editingAppReport.name}"? This will reset the application category for all associated expenses to default.`
          : ''
        }
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        type="warning"
      />
    </>
  );
};
