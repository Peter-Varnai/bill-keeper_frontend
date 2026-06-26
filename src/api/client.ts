import axios from 'axios';
import type { Bill, Expense, Summary, EarResponse, DataGroup, ApplicationReport, ReportItem } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'auth_token';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        console.log(`[RESPONSE] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error(`[ERROR] ${error.response?.status} ${error.config?.url}`, error.response?.data);
        return Promise.reject(error);
    }
);

// Bills API
export const getBills = (dataGroup: number): Promise<Bill[]> =>
    apiClient.get(`/bills?data_group=${dataGroup}`).then((res) => res.data);

export const getBill = (id: number, dataGroup: number): Promise<Bill> =>
    apiClient.get(`/bills/${id}?data_group=${dataGroup}`).then((res) => res.data);

export const updateBill = (id: number, bill: Partial<Bill>, data_group: number): Promise<void> =>
    apiClient.put(`/bills`, { ...bill, id, data_group }).then((res) => res.data);

// Delete bill
export const deleteBill = (id: number, data_group: number): Promise<void> =>
    apiClient.delete(`/bills/${id}?data_group=${data_group}`).then((res) => res.data);

// Upload bills (files)
export const uploadBills = (
    files: File[],
    dataGroup: number
): Promise<{
    success: boolean;
    data_group: number;
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
    formData.append('data_group', dataGroup.toString());
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
export const getExpenses = (dataGroup: number): Promise<Expense[]> =>
    apiClient.get(`/expenses?data_group=${dataGroup}`).then((res) => res.data);

export const updateExpenseBill = (id: number, billNumber: number, dataGroup: number): Promise<void> =>
    apiClient.patch(`/expenses/${id}/bill?data_group=${dataGroup}`, { expense_id: id, new_number: billNumber }).then((res) => res.data);

export const updateExpenseType = (id: number, typeId: number, dataGroup: number): Promise<void> =>
    apiClient.patch(`/expenses/${id}/type?data_group=${dataGroup}`, { expense_id: id, new_number: typeId }).then((res) => res.data);

export const updateExpenseApplication = (id: number, appId: number, dataGroup: number): Promise<void> =>
    apiClient.patch(`/expenses/${id}/application?data_group=${dataGroup}`, { expense_id: id, new_number: appId }).then((res) => res.data);

export const updateExpenseCash = (id: number, isCash: boolean, dataGroup: number): Promise<void> =>
    apiClient.patch(`/expenses/${id}/cash?data_group=${dataGroup}`, { expense_id: id, new_number: isCash ? 1 : 0 }).then((res) => res.data);

// Delete expense
export const deleteExpense = (id: number, dataGroup: number): Promise<void> =>
    apiClient.delete(`/expenses/${id}?data_group=${dataGroup}`).then((res) => res.data);

// Create single expense
export const createExpense = (
    expense: {
        partner: string;
        amount: string;
        date?: string;
        expense_type?: number;
        bill?: number;
        application?: number;
        is_cash?: boolean;
    },
    data_group: number
): Promise<Expense> =>
    apiClient.post(`/expenses`, { ...expense, data_group: data_group }).then((res) => res.data);

// Bulk import expenses from CSV
export const bulkImportExpenses = (
    data: {
        date_format: string;
        rows: Array<{ partner: string; amount: number; date: string; row_number: number }>;
    },
    data_group: number
): Promise<{
    inserted: number;
    duplicates_found: number;
    duplicates_skipped: number;
    errors: Array<{ row: number; reason: string }>;
    total_processed: number;
}> =>
    apiClient.post(`/expenses/bulk`, { ...data, data_group: data_group }).then((res) => res.data);

// Summaries API
export const getSummaries = (dataGroup: number): Promise<Summary[]> =>
    apiClient.get(`/summaries?data_group=${dataGroup}`).then((res) => res.data);

// EAR API
export const getEar = (dataGroup: number): Promise<EarResponse> =>
    apiClient.get(`/ear?data_group=${dataGroup}`).then((res) => res.data);

// Reports API
export const getReportByApplicationReport = (applicationReportId: number, dataGroup: number): Promise<ReportItem[]> =>
    apiClient.get(`/reports?application_report_id=${applicationReportId}&data_group=${dataGroup}`).then((res) => res.data);

// Data Groups API
export const getDataGroups = (): Promise<DataGroup[]> =>
    apiClient.get('/data_groups').then((res) => res.data);

export const createDataGroup = (name: string, group_type: 'project' | 'organization'): Promise<DataGroup> =>
    apiClient.post('/data_groups', { name, type: group_type }).then((res) => res.data);

export const deleteDataGroup = (id: number): Promise<{ success: boolean; message: string }> =>
    apiClient.delete(`/data_groups/${id}`).then((res) => res.data);

// Application Reports API
export const getApplicationReports = (dataGroup: number): Promise<ApplicationReport[]> =>
    apiClient.get(`/application_reports?data_group=${dataGroup}`).then((res) => res.data);

export const createApplicationReport = (data: {
    name: string;
    amount: number;
    submission_deadline?: string;
    data_group: number;
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
export const getImageUrl = (filename: string, dataGroup: number): string => {
    const url = `${API_BASE_URL}/images/${encodeURIComponent(filename)}?data_group=${dataGroup}`;
    console.log('[getImageUrl]', { filename, dataGroup: dataGroup, url });
    return url;
};

// Utility Data API (bank_stand, cash_stand)
export interface UtilityDataResponse {
    data_group: number;
    bank_stand: number | null;
    cash_stand: number | null;
    expense_summary: {
        bank_total: number;
        cash_total: number;
    };
    calculated_totals: {
        bank_with_expenses: number;
        cash_with_expenses: number;
    };
}

export const getUtilityData = (dataGroup: number): Promise<UtilityDataResponse> =>
    apiClient.get(`/utild?data_group=${dataGroup}`).then((res) => res.data);

export const saveUtilityData = (
    dataGroup: number,
    bankStand: number | null,
    cashStand: number | null
): Promise<{ success: boolean; data_group: number }> =>
    apiClient.put('/utild', { data_group: dataGroup, bank_stand: bankStand, cash_stand: cashStand }).then((res) => res.data);
