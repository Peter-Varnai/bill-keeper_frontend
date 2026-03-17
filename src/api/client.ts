import axios from 'axios';
import type { Bill, Expense, Summary, EarResponse, ReportItem, DataGroup, ApplicationReport } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bills API
export const getBills = (groupId: number): Promise<Bill[]> =>
  apiClient.get(`/bills?group_id=${groupId}`).then((res) => res.data);

export const getBill = (id: number, groupId: number): Promise<Bill> =>
  apiClient.get(`/bills/${id}?group_id=${groupId}`).then((res) => res.data);

export const updateBill = (id: number, bill: Partial<Bill>, groupId: number): Promise<void> =>
  apiClient.put(`/bills/${id}?group_id=${groupId}`, bill).then((res) => res.data);

// Delete bill
export const deleteBill = (id: number, groupId: number): Promise<void> =>
  apiClient.delete(`/bills/${id}?group_id=${groupId}`).then((res) => res.data);

// Upload bills (files)
export const uploadBills = (
  files: File[],
  groupId: number
): Promise<{
  success: boolean;
  group_id: number;
  total_files: number;
  success_count: number;
  error_count: number;
  results: Array<{
    filename: string;
    bill_id: number | null;
    success: boolean;
    error: string | null;
  }>;
}> => {
  const formData = new FormData();
  formData.append('group_id', groupId.toString());
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  return apiClient.post('/bills/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((res) => res.data);
};

// Expenses API
export const getExpenses = (groupId: number): Promise<Expense[]> =>
  apiClient.get(`/expenses?group_id=${groupId}`).then((res) => res.data);

export const updateExpenseBill = (id: number, billNumber: number, groupId: number): Promise<void> =>
  apiClient.patch(`/expenses/${id}/bill?group_id=${groupId}`, { expense_id: id, new_number: billNumber }).then((res) => res.data);

export const updateExpenseType = (id: number, typeId: number, groupId: number): Promise<void> =>
  apiClient.patch(`/expenses/${id}/type?group_id=${groupId}`, { expense_id: id, new_number: typeId }).then((res) => res.data);

export const updateExpenseApplication = (id: number, appId: number, groupId: number): Promise<void> =>
  apiClient.patch(`/expenses/${id}/application?group_id=${groupId}`, { expense_id: id, new_number: appId }).then((res) => res.data);

export const updateExpenseCash = (id: number, isCash: boolean, groupId: number): Promise<void> =>
  apiClient.patch(`/expenses/${id}/cash?group_id=${groupId}`, { expense_id: id, new_number: isCash ? 1 : 0 }).then((res) => res.data);

// Delete expense
export const deleteExpense = (id: number, groupId: number): Promise<void> =>
  apiClient.delete(`/expenses/${id}?group_id=${groupId}`).then((res) => res.data);

// Create single expense
export const createExpense = (
  expense: { 
    partner: string; 
    amount: string; 
    date?: string;
    expense_type?: number;
    bill?: number;
    application?: number;
    Bargeldabhebung?: boolean;
  },
  groupId: number
): Promise<Expense> =>
  apiClient.post(`/expenses`, { ...expense, group_id: groupId }).then((res) => res.data);

// Check for duplicates
export const checkDuplicates = (
  expenses: Array<{ partner: string; amount: string; date?: string }>,
  groupId: number
): Promise<Array<{ index: number; existing: Expense }>> =>
  apiClient.post(`/expenses/check-duplicates`, { expenses, group_id: groupId }).then((res) => res.data);

// Bulk import expenses from CSV
export const bulkImportExpenses = (
  data: {
    partner_col: string;
    amount_col: string;
    date_col: string;
    date_format: string;
    rows: Array<{ partner: string; amount: string; date: string; row_number: number }>;
  },
  groupId: number
): Promise<{
  inserted: number;
  duplicates_found: number;
  duplicates_skipped: number;
  errors: Array<{ row: number; reason: string }>;
  total_processed: number;
}> =>
  apiClient.post(`/expenses/bulk`, { ...data, group_id: groupId }).then((res) => res.data);

// Summaries API
export const getSummaries = (groupId: number): Promise<Summary[]> =>
  apiClient.get(`/summaries?group_id=${groupId}`).then((res) => res.data);

// EAR API
export const getEar = (groupId: number): Promise<EarResponse> =>
  apiClient.get(`/ear?group_id=${groupId}`).then((res) => res.data);

// Reports API
export const getReportByApplicationReport = (applicationReportId: number, groupId: number): Promise<ReportItem[]> =>
  apiClient.get(`/reports?application_report_id=${applicationReportId}&group_id=${groupId}`).then((res) => res.data);

// Data Groups API
export const getDataGroups = (): Promise<DataGroup[]> =>
  apiClient.get('/data_groups').then((res) => res.data);

export const createDataGroup = (name: string, group_type: 'project' | 'organization'): Promise<DataGroup> =>
  apiClient.post('/data_groups', { name, group_type }).then((res) => res.data);

// Application Reports API
export const getApplicationReports = (groupId: number): Promise<ApplicationReport[]> =>
  apiClient.get(`/application_reports?group_id=${groupId}`).then((res) => res.data);

export const createApplicationReport = (data: {
  name: string;
  amount: number;
  submission_deadline?: string;
  group_id: number;
}): Promise<ApplicationReport> =>
  apiClient.post('/application_reports', data).then((res) => res.data);

export const updateApplicationReport = (
  id: number,
  data: { name?: string; amount?: number; submission_deadline?: string | null }
): Promise<void> =>
  apiClient.patch(`/application_reports/${id}`, data).then((res) => res.data);

export const deleteApplicationReport = (id: number): Promise<void> =>
  apiClient.delete(`/application_reports/${id}`).then((res) => res.data);

// Images
export const getImageUrl = (filename: string, groupId: number): string => {
  const url = `${API_BASE_URL}/images/${encodeURIComponent(filename)}?group_id=${groupId}`;
  console.log('[getImageUrl]', { filename, groupId, url });
  return url;
};
