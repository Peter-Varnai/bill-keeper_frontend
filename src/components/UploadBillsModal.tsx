import React, { useState, useRef, useCallback } from 'react';
import { useUploadBills } from '../hooks/useBills';
import { Window, Button } from './windows98';

interface UploadBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataGroupId: number;
  onSuccess: () => void;
}

type UploadMode = 'select' | 'uploading' | 'results';

interface UploadFile {
  file: File;
  path: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadResult {
  filename: string;
  bill_id: number | null;
  success: boolean;
  error: string | null;
}

export const UploadBillsModal: React.FC<UploadBillsModalProps> = ({
  isOpen,
  onClose,
  dataGroupId,
  onSuccess,
}) => {
  const [mode, setMode] = useState<UploadMode>('select');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [duplicateAlerts, setDuplicateAlerts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadBills(dataGroupId);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

  const isValidFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      return false;
    }
    return true;
  };

  const processFiles = useCallback((fileList: FileList | null, pathPrefix: string = '') => {
    if (!fileList) return;

    const newFiles: UploadFile[] = [];
    Array.from(fileList).forEach((file) => {
      const path = pathPrefix ? `${pathPrefix}/${file.name}` : file.name;
      
      if (isValidFile(file)) {
        newFiles.push({
          file,
          path,
          status: 'pending',
        });
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input
    if (e.target.value) {
      e.target.value = '';
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Group files by their relative path
    const pathMap = new Map<string, File[]>();
    
    Array.from(files).forEach((file) => {
      // webkitRelativePath contains the full path within the selected folder
      const fullPath = (file as any).webkitRelativePath || file.name;
      const pathParts = fullPath.split('/');
      
      // Remove the root folder name from the path
      if (pathParts.length > 1) {
        pathParts.shift(); // Remove root folder
      }
      
      const relativePath = pathParts.slice(0, -1).join('/');
      
      if (!pathMap.has(relativePath)) {
        pathMap.set(relativePath, []);
      }
      pathMap.get(relativePath)!.push(file);
    });

    // Process all files from all subdirectories
    Array.from(files).forEach((file) => {
      const fullPath = (file as any).webkitRelativePath || file.name;
      const pathParts = fullPath.split('/');
      pathParts.shift(); // Remove root folder
      
      if (isValidFile(file)) {
        const newFiles: UploadFile[] = [{
          file,
          path: pathParts.join('/'),
          status: 'pending',
        }];
        setFiles((prev) => [...prev, ...newFiles]);
      }
    });

    // Reset input
    if (e.target.value) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setMode('uploading');

    try {
      const filesToUpload = files.map((f) => f.file);
      
      // Use the mutation hook which handles cache invalidation
      const response = await uploadMutation.mutateAsync(filesToUpload);

      // Collect duplicate alerts
      const duplicates: string[] = [];
      response.results.forEach((result) => {
        if (!result.success && result.error?.includes('already exists')) {
          duplicates.push(result.filename);
        }
      });

      if (duplicates.length > 0) {
        setDuplicateAlerts(duplicates);
      }

      setResults(response.results);
      setMode('results');

      if (response.success_count > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setResults([
        {
          filename: 'Upload failed',
          bill_id: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ]);
      setMode('results');
    }
  };

  const handleClose = () => {
    setMode('select');
    setFiles([]);
    setResults([]);
    setDuplicateAlerts([]);
    onClose();
  };

  const handleReset = () => {
    setMode('select');
    setFiles([]);
    setResults([]);
    setDuplicateAlerts([]);
  };

  if (!isOpen) return null;

  const renderSelectMode = () => (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Upload Bills
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
          Select files or a folder to upload. Supported formats: JPG, PNG, PDF (max 10MB each)
        </div>
      </div>

      {/* File selection buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFolderSelect}
          {...{ webkitdirectory: "true", directory: "true" } as any}
          style={{ display: 'none' }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          style={{ flex: 1 }}
        >
          Select Files
        </Button>
        <Button
          onClick={() => folderInputRef.current?.click()}
          style={{ flex: 1 }}
        >
          Select Folder
        </Button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Selected Files ({files.length})
          </div>
          <div
            style={{
              maxHeight: '200px',
              overflow: 'auto',
              border: '2px inset #c0c0c0',
              backgroundColor: '#fff',
              padding: '8px',
            }}
          >
            {files.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <span style={{ fontSize: '12px', flex: 1 }}>{file.path}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0}
          style={{
            backgroundColor: files.length > 0 ? '#d4d0c8' : '#c0c0c0',
          }}
        >
          Upload ({files.length} files)
        </Button>
      </div>
    </div>
  );

  const renderUploadingMode = () => (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
        Uploading Bills...
      </div>
      <div
        style={{
          width: '100%',
          height: '24px',
          backgroundColor: '#c0c0c0',
          border: '2px inset #fff',
          padding: '2px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            width: '50%',
            height: '100%',
            backgroundColor: '#000080',
            animation: 'progress 2s ease-in-out infinite',
          }}
        />
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        Please wait while files are being processed...
      </div>
    </div>
  );

  const renderResultsMode = () => {
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return (
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
          Upload Results
        </div>

        {/* Summary */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f0f0f0',
            border: '2px outset #fff',
          }}
        >
          <div>
            <span style={{ fontWeight: 'bold' }}>Success:</span> {successCount}
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>Errors:</span> {errorCount}
          </div>
        </div>

        {/* Results list */}
        <div
          style={{
            maxHeight: '250px',
            overflow: 'auto',
            border: '2px inset #c0c0c0',
            backgroundColor: '#fff',
            padding: '8px',
            marginBottom: '16px',
          }}
        >
          {results.map((result, index) => (
            <div
              key={index}
              style={{
                padding: '4px',
                borderBottom: '1px solid #ddd',
                color: result.success ? 'green' : 'red',
                fontSize: '12px',
              }}
            >
              {result.success ? (
                <span>
                  ✓ {result.filename} (Bill #{result.bill_id})
                </span>
              ) : (
                <span>
                  ✗ {result.filename}: {result.error}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Duplicate alerts (if any) */}
        {duplicateAlerts.length > 0 && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '2px outset #fff',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
              Duplicate Files Skipped:
            </div>
            <div style={{ fontSize: '11px', color: '#856404' }}>
              {duplicateAlerts.join(', ')}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleReset}>Upload More</Button>
        </div>
      </div>
    );
  };

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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Window
          title="Upload Bills"
          style={{ width: '500px', maxHeight: '80vh' }}
        >
          {mode === 'select' && renderSelectMode()}
          {mode === 'uploading' && renderUploadingMode()}
          {mode === 'results' && renderResultsMode()}
        </Window>
      </div>
    </div>
  );
};
