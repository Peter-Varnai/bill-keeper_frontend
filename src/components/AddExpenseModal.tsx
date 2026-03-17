import React, { useState, useRef, useCallback } from 'react';
import { useCreateExpense, useBulkImportExpenses } from '../hooks/useExpenses';
import { EXPENSE_TYPES, APPLICATIONS } from '../api/types';
import Papa from 'papaparse';
import type { Expense } from '../api/types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataGroupId: number;
  onSuccess: () => void;
}

type ModalMode = 'manual' | 'csv-upload' | 'csv-preview' | 'duplicate-review' | 'importing' | 'results';

interface CsvRow {
  [key: string]: string;
}

const _DATE_FORMATS = [
  { value: 'auto-detect', label: 'Auto-detect' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
];

// Windows 98 styled progress bar component
const _Win98ProgressBar: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => {
  return (
    <div style={{ marginTop: '16px' }}>
      {label && <div style={{ fontSize: '12px', marginBottom: '4px' }}>{label}</div>}
      <div
        style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#c0c0c0',
          border: '2px inset #fff',
          padding: '2px',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: '#000080',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};

// Windows 98 styled date picker
const Win98DatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label?: string;
}> = ({ value, onChange, label }) => {
  return (
    <div className="field-row">
      {label && <label style={{ fontSize: '12px', marginRight: '8px' }}>{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '4px 8px',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          border: '2px inset #c0c0c0',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  dataGroupId,
  onSuccess,
}) => {
  const [mode, setMode] = useState<ModalMode>('manual');
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual form state
  const [manualForm, setManualForm] = useState({
    partner: '',
    amount: '',
    date: '',
    expense_type: 0,
    bill: 0,
    application: 0,
    Bargeldabhebung: false,
  });
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});
  
  // CSV state
  const [_csvColumns, _setCsvColumns] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [_csvFileName, _setCsvFileName] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState({
    partner: '',
    amount: '',
    date: '',
  });
  const [dateFormat, setDateFormat] = useState('auto-detect');
  const [detectedDateFormat, setDetectedDateFormat] = useState('');
  const [_invalidRows, setInvalidRows] = useState<number[]>([]);
  
  // Duplicate detection state
  const [_duplicates, setDuplicates] = useState<Array<{ index: number; row: CsvRow; existing: Expense }>>([]);
  const [_approvedDuplicates, _setApprovedDuplicates] = useState<Set<number>>(new Set());
  
  // Import progress
  const [_importProgress, _setImportProgress] = useState(0);
  const [_importResults, _setImportResults] = useState<{
    inserted: number;
    duplicates_found: number;
    duplicates_skipped: number;
    errors: Array<{ row: number; reason: string }>;
    total_processed: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Query hooks
  const createExpenseMutation = useCreateExpense(dataGroupId);
  const bulkImportMutation = useBulkImportExpenses();
  
  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode('manual');
      setManualForm({
        partner: '',
        amount: '',
        date: '',
        expense_type: 0,
        bill: 0,
        application: 0,
        Bargeldabhebung: false,
      });
      setManualErrors({});
      _setCsvColumns([]);
      setCsvRows([]);
      _setCsvFileName('');
      setColumnMapping({ partner: '', amount: '', date: '' });
      setDateFormat('auto-detect');
      setDetectedDateFormat('');
      setInvalidRows([]);
      setDuplicates([]);
      _setApprovedDuplicates(new Set());
      _setImportProgress(0);
      _setImportResults(null);
    }
  }, [isOpen]);
  
  // Normalize amount helper
  const normalizeAmount = useCallback((value: string): number | null => {
    const clean = value.trim();
    if (clean.length === 0) return null;
    
    // Remove currency symbols
    let result = clean.replace(/[€$£¥]/g, '');
    
    // Find last comma or dot
    const lastComma = result.lastIndexOf(',');
    const lastDot = result.lastIndexOf('.');
    
    if (lastComma > lastDot && lastComma !== -1) {
      // European format: 1.234,56
      result = result.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > -1) {
      // US format or already normalized
      result = result.replace(/,/g, '');
    } else if (lastComma !== -1) {
      // Only comma - check if decimal
      const afterComma = result.length - lastComma - 1;
      if (afterComma <= 2) {
        result = result.replace(',', '.');
      } else {
        result = result.replace(/,/g, '');
      }
    }
    
    const parsed = parseFloat(result);
    return isNaN(parsed) ? null : parsed;
  }, []);
  
  // Helper function to parse amount and determine sign
  const getAmountSign = useCallback((): 'positive' | 'negative' | 'zero' | 'invalid' => {
    const normalized = normalizeAmount(manualForm.amount);
    if (normalized === null) return 'invalid';
    if (normalized === 0) return 'zero';
    if (normalized > 0) return 'positive';
    return 'negative';
  }, [manualForm.amount, normalizeAmount]);
  
  // Helper function to get filtered expense type options based on amount
  const getFilteredExpenseTypes = useCallback(() => {
    const sign = getAmountSign();
    
    if (sign === 'zero' || sign === 'invalid') {
      return [];
    }
    
    return Object.entries(EXPENSE_TYPES).filter(([key]) => {
      const num = Number(key);
      if (sign === 'positive') {
        // Positive amounts: None (0) + income categories (50-56)
        return num === 0 || (num >= 50 && num <= 56);
      } else {
        // Negative amounts: expense categories (0-19)
        return num >= 0 && num <= 19;
      }
    });
  }, [getAmountSign]);
  
  // Detect date format
  const detectDateFormat = useCallback((samples: string[]): string => {
    const formats = [
      { regex: /^\d{2}\.\d{2}\.\d{4}$/, format: 'DD.MM.YYYY' },
      { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD' },
      { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'DD/MM/YYYY' },
      { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'MM/DD/YYYY' },
    ];
    
    for (const { regex, format } of formats) {
      const allMatch = samples.every(date => regex.test(date.trim()));
      if (allMatch) return format;
    }
    
    return 'DD.MM.YYYY'; // Default fallback
  }, []);
  
  // Handle manual form submission
  const handleManualSubmit = async () => {
    const errors: Record<string, string> = {};
    
    if (!manualForm.partner.trim()) {
      errors.partner = 'Partner is required';
    }
    
    const normalizedAmount = normalizeAmount(manualForm.amount);
    if (normalizedAmount === null) {
      errors.amount = 'Invalid amount format';
    }
    
    if (Object.keys(errors).length > 0) {
      setManualErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      await createExpenseMutation.mutateAsync({
        partner: manualForm.partner,
        amount: manualForm.amount,
        date: manualForm.date || undefined,
        expense_type: manualForm.expense_type || undefined,
        bill: manualForm.bill || undefined,
        application: manualForm.application || undefined,
        Bargeldabhebung: manualForm.Bargeldabhebung || undefined,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create expense:', error);
      setManualErrors({ submit: 'Failed to create expense. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    _setCsvFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && Array.isArray(results.data) && results.data.length > 0) {
          const columns = results.meta.fields || Object.keys(results.data[0] as CsvRow);
          const rows = results.data as CsvRow[];
          
          _setCsvColumns(columns);
          setCsvRows(rows);
          setMode('csv-preview');
          
          // Auto-detect column mappings based on common names
          const detectedMapping = {
            partner: '',
            amount: '',
            date: '',
          };
          
          columns.forEach(col => {
            const lower = col.toLowerCase();
            if (lower.includes('partner') || lower.includes('name') || lower.includes('vendor')) {
              detectedMapping.partner = col;
            }
            if (lower.includes('amount') || lower.includes('sum') || lower.includes('price') || lower.includes('betrag')) {
              detectedMapping.amount = col;
            }
            if (lower.includes('date') || lower.includes('datum') || lower.includes('day')) {
              detectedMapping.date = col;
            }
          });
          
          setColumnMapping(detectedMapping);
          
          // Detect date format from samples
          if (detectedMapping.date && rows.length > 0) {
            const samples = rows.slice(0, 5).map(row => row[detectedMapping.date]).filter(Boolean);
            if (samples.length > 0) {
              const detected = detectDateFormat(samples);
              setDetectedDateFormat(detected);
              setDateFormat('auto-detect');
            }
          }
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Failed to parse CSV file. Please check the file format.');
      },
    });
  };
  
  // Validate CSV rows (for highlighting only, not blocking)
  const validateRows = useCallback((): number[] => {
    const invalid: number[] = [];
    
    csvRows.forEach((row, index) => {
      const partner = row[columnMapping.partner]?.trim();
      const amount = row[columnMapping.amount];
      
      if (!partner) {
        invalid.push(index);
      } else if (normalizeAmount(amount) === null) {
        invalid.push(index);
      }
    });
    
    return invalid;
  }, [csvRows, columnMapping, normalizeAmount]);
  
  // Handle import directly (simplified - no duplicate checking, import all rows)
  const handleImportAll = async () => {
    // Validate rows for highlighting only
    const invalid = validateRows();
    setInvalidRows(invalid);
    
    // Prepare all rows for import (invalid amounts will be treated as 0)
    const rowsToImport = csvRows.map((row, index) => {
      const amount = row[columnMapping.amount];
      const normalizedAmount = normalizeAmount(amount);
      
      return {
        partner: row[columnMapping.partner]?.trim() || 'Unknown',
        amount: normalizedAmount !== null ? amount : '0',
        date: row[columnMapping.date] || '',
        row_number: index + 1,
      };
    });
    
    setMode('importing');
    _setImportProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      _setImportProgress((prev: number) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      const result = await bulkImportMutation.mutateAsync({
        groupId: dataGroupId,
        partner_col: columnMapping.partner,
        amount_col: columnMapping.amount,
        date_col: columnMapping.date,
        date_format: dateFormat === 'auto-detect' ? detectedDateFormat : dateFormat,
        rows: rowsToImport,
      });
      
      clearInterval(progressInterval);
      _setImportProgress(100);
      _setImportResults(result);
      
      // Close modal and refresh on success
      onSuccess();
      onClose();
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Import failed:', error);
      setMode('csv-preview');
      alert('Import failed. Please try again.');
    }
  };
  
  // Render manual entry form
  const renderManualForm = () => (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Add Expense Manually</h3>
      
      {/* Required Fields */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#404040' }}>
          Required Fields:
        </div>
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Partner:</label>
          <input
            type="text"
            value={manualForm.partner}
            onChange={(e) => setManualForm({ ...manualForm, partner: e.target.value })}
            placeholder="Enter partner name"
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              border: '2px inset #c0c0c0',
            }}
          />
        </div>
        {manualErrors.partner && (
          <div style={{ color: 'red', fontSize: '11px', marginLeft: '100px' }}>{manualErrors.partner}</div>
        )}
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Amount:</label>
          <input
            type="text"
            value={manualForm.amount}
            onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
            placeholder="e.g., 1234.56 or 1.234,56"
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              border: '2px inset #c0c0c0',
            }}
          />
        </div>
        {manualErrors.amount && (
          <div style={{ color: 'red', fontSize: '11px', marginLeft: '100px' }}>{manualErrors.amount}</div>
        )}
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Date:</label>
          <Win98DatePicker
            value={manualForm.date}
            onChange={(value) => setManualForm({ ...manualForm, date: value })}
          />
        </div>
      </div>
      
      {/* Optional Fields */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#404040' }}>
          Optional Fields (defaults shown):
        </div>
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Expense Type:</label>
          <select
            value={manualForm.expense_type}
            onChange={(e) => setManualForm({ ...manualForm, expense_type: parseInt(e.target.value) })}
            disabled={getAmountSign() === 'zero' || getAmountSign() === 'invalid'}
            style={{
              flex: 1,
              padding: '4px',
              fontSize: '14px',
              backgroundColor: '#c0c0c0',
              border: '2px outset #fff',
              opacity: getAmountSign() === 'zero' || getAmountSign() === 'invalid' ? 0.5 : 1,
            }}
          >
            {getFilteredExpenseTypes().map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Bill #:</label>
          <input
            type="number"
            value={manualForm.bill}
            onChange={(e) => setManualForm({ ...manualForm, bill: parseInt(e.target.value) || 0 })}
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              border: '2px inset #c0c0c0',
            }}
          />
        </div>
        
        <div className="field-row" style={{ marginBottom: '8px' }}>
          <label style={{ width: '100px', fontSize: '12px' }}>Application:</label>
          <select
            value={manualForm.application}
            onChange={(e) => setManualForm({ ...manualForm, application: parseInt(e.target.value) })}
            style={{
              flex: 1,
              padding: '4px',
              fontSize: '14px',
              backgroundColor: '#c0c0c0',
              border: '2px outset #fff',
            }}
          >
            {Object.entries(APPLICATIONS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        <div className="field-row">
          <input
            id="cash-checkbox"
            type="checkbox"
            checked={manualForm.Bargeldabhebung}
            onChange={(e) => setManualForm({ ...manualForm, Bargeldabhebung: e.target.checked })}
          />
          <label htmlFor="cash-checkbox" style={{ fontSize: '12px' }}>
            Cash (Bargeldabhebung)
          </label>
        </div>
      </div>
      
      {manualErrors.submit && (
        <div style={{ color: 'red', fontSize: '12px', marginBottom: '8px' }}>{manualErrors.submit}</div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setMode('csv-upload')}
          disabled={isLoading}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            backgroundColor: '#c0c0c0',
            border: '2px outset #fff',
            cursor: 'pointer',
          }}
        >
          Import CSV
        </button>
        <button
          onClick={handleManualSubmit}
          disabled={isLoading}
          style={{
            padding: '6px 16px',
            fontSize: '12px',
            backgroundColor: '#c0c0c0',
            border: '2px outset #fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </div>
  );
  
  // Render CSV upload
  const renderCsvUpload = () => (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Import Expenses from CSV</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            backgroundColor: '#c0c0c0',
            border: '2px outset #fff',
            cursor: 'pointer',
          }}
        >
          Select CSV File
        </button>
      </div>
      
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '16px' }}>
        CSV should have columns: Partner, Amount, Date
      </div>
      
      <button
        onClick={() => setMode('manual')}
        style={{
          padding: '6px 16px',
          fontSize: '12px',
          backgroundColor: '#c0c0c0',
          border: '2px outset #fff',
          cursor: 'pointer',
        }}
      >
        Back to Manual Entry
      </button>
    </div>
  );
  
  // Render CSV preview with column mapping
  const renderCsvPreview = () => {
    // Validate rows for highlighting only
    const invalid = validateRows();
    
    return (
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Review CSV Data</h3>
        
        {/* File info */}
        <div style={{ fontSize: '12px', marginBottom: '16px', color: '#404040' }}>
          <strong>File:</strong> {_csvFileName} | 
          <strong> Rows:</strong> {csvRows.length} total | 
          <span style={{ color: '#800000' }}>
            {invalid.length} invalid (will be imported with defaults)
          </span>
        </div>
        
        {/* Column Mapping */}
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#d4d0c8', border: '2px inset #c0c0c0' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Map CSV Columns (all required):
          </div>
          
          <div className="field-row" style={{ marginBottom: '8px' }}>
            <label style={{ width: '120px', fontSize: '12px' }}>Partner Column:</label>
            <select
              value={columnMapping.partner}
              onChange={(e) => setColumnMapping({ ...columnMapping, partner: e.target.value })}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: '14px',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
              }}
            >
              <option value="">Select column...</option>
              {_csvColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="field-row" style={{ marginBottom: '8px' }}>
            <label style={{ width: '120px', fontSize: '12px' }}>Amount Column:</label>
            <select
              value={columnMapping.amount}
              onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: '14px',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
              }}
            >
              <option value="">Select column...</option>
              {_csvColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="field-row" style={{ marginBottom: '8px' }}>
            <label style={{ width: '120px', fontSize: '12px' }}>Date Column:</label>
            <select
              value={columnMapping.date}
              onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
              style={{
                flex: 1,
                padding: '4px',
                fontSize: '14px',
                backgroundColor: '#c0c0c0',
                border: '2px outset #fff',
              }}
            >
              <option value="">Select column...</option>
              {_csvColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          {/* Date format selector */}
          {columnMapping.date && (
            <div className="field-row">
              <label style={{ width: '120px', fontSize: '12px' }}>Date Format:</label>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '14px',
                    backgroundColor: '#c0c0c0',
                    border: '2px outset #fff',
                  }}
                >
                  {_DATE_FORMATS.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
                {detectedDateFormat && dateFormat === 'auto-detect' && (
                  <span style={{ fontSize: '11px', color: '#008000' }}>
                    Detected: {detectedDateFormat}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Preview Table - ALL rows with scrolling after 16 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Preview (all {csvRows.length} rows):
          </div>
          
          <div style={{ 
            maxHeight: '400px',  // Scrollable after ~16 rows
            overflow: 'auto', 
            border: '2px inset #c0c0c0' 
          }}>
            <table className="table" style={{ width: '100%', fontSize: '11px' }}>
              <thead>
                <tr>
                  {_csvColumns.map(col => (
                    <th key={col} style={{ 
                      backgroundColor: '#c0c0c0', 
                      padding: '4px',
                      borderBottom: '2px solid #808080',
                      fontSize: '11px'
                    }}>
                      {col}
                      {col === columnMapping.partner && ' (Partner)'}
                      {col === columnMapping.amount && ' (Amount)'}
                      {col === columnMapping.date && ' (Date)'}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvRows.map((row, index) => (
                  <tr 
                    key={index}
                    style={{
                      backgroundColor: invalid.includes(index) ? '#ffe0e0' : 'inherit'
                    }}
                  >
                    {_csvColumns.map(col => (
                      <td key={col} style={{ padding: '4px', borderBottom: '1px solid #c0c0c0' }}>
                        {row[col]?.substring(0, 30)}{row[col]?.length > 30 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setMode('csv-upload');
              _setCsvColumns([]);
              setCsvRows([]);
            }}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              backgroundColor: '#c0c0c0',
              border: '2px outset #fff',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
          <button
            onClick={() => setMode('manual')}
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
          <button
            onClick={handleImportAll}
            disabled={!columnMapping.partner || !columnMapping.amount || !columnMapping.date || isLoading}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              backgroundColor: '#c0c0c0',
              border: '2px outset #fff',
              cursor: (!columnMapping.partner || !columnMapping.amount || !columnMapping.date || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (!columnMapping.partner || !columnMapping.amount || !columnMapping.date || isLoading) ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Importing...' : `Import Expenses (${csvRows.length})`}
          </button>
        </div>
      </div>
    );
  };
  
  // Render importing progress
  const renderImporting = () => (
    <div style={{ padding: '32px', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 24px 0', fontSize: '16px' }}>Importing Expenses...</h3>
      
      <_Win98ProgressBar progress={_importProgress} label={`${_importProgress}% complete`} />
      
      <div style={{ marginTop: '24px', fontSize: '12px', color: '#666' }}>
        Please wait while we process your CSV file.
        <br />
        Do not close this window.
      </div>
    </div>
  );
  
  // NOW check if modal should be shown - AFTER all hooks!
  if (!isOpen) return null;
  
  // Main render
  return (
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
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
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
            {mode === 'manual' ? 'Add New Expense' : 
             mode === 'csv-upload' ? 'Import from CSV' : 
             mode === 'csv-preview' ? 'Review CSV Data' :
             mode === 'importing' ? 'Importing...' : 'Import Results'}
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
        
        <div className="window-body">
          {mode === 'manual' && renderManualForm()}
          {mode === 'csv-upload' && renderCsvUpload()}
          {mode === 'csv-preview' && renderCsvPreview()}
          {mode === 'importing' && renderImporting()}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;