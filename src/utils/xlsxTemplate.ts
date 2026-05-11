import type { ReportItem } from '../api/types';

export interface XlsxTemplateData {
    applicationName: string;
    dataGroupId: number;
    expenses: ReportItem[];
    total: number;
}

const DUMMY_EXPENSES: ReportItem[] = [
    { expense_id: 1, partner: 'Partner 1', amount: '100.00', date: '2024-01-15', expense_type: 1, filename: '', is_cash: false },
    { expense_id: 2, partner: 'Partner 2', amount: '200.00', date: '2024-01-16', expense_type: 2, filename: '', is_cash: false },
    { expense_id: 3, partner: 'Partner 3', amount: '150.00', date: '2024-01-17', expense_type: 3, filename: '', is_cash: false },
    { expense_id: 4, partner: 'Partner 4', amount: '300.00', date: '2024-01-18', expense_type: 4, filename: '', is_cash: false },
    { expense_id: 5, partner: 'Partner 5', amount: '250.00', date: '2024-01-19', expense_type: 5, filename: '', is_cash: false },
    { expense_id: 6, partner: 'Partner 6', amount: '175.00', date: '2024-01-20', expense_type: 6, filename: '', is_cash: false },
    { expense_id: 7, partner: 'Partner 7', amount: '225.00', date: '2024-01-21', expense_type: 7, filename: '', is_cash: false },
    { expense_id: 8, partner: 'Partner 8', amount: '125.00', date: '2024-01-22', expense_type: 8, filename: '', is_cash: false },
    { expense_id: 9, partner: 'Partner 9', amount: '350.00', date: '2024-01-23', expense_type: 9, filename: '', is_cash: false },
    { expense_id: 10, partner: 'Partner 10', amount: '275.00', date: '2024-01-24', expense_type: 10, filename: '', is_cash: false },
    { expense_id: 11, partner: 'Partner 11', amount: '400.00', date: '2024-01-25', expense_type: 1, filename: '', is_cash: false },
    { expense_id: 12, partner: 'Partner 12', amount: '180.00', date: '2024-01-26', expense_type: 2, filename: '', is_cash: false },
    { expense_id: 13, partner: 'Partner 13', amount: '220.00', date: '2024-01-27', expense_type: 3, filename: '', is_cash: false },
    { expense_id: 14, partner: 'Partner 14', amount: '160.00', date: '2024-01-28', expense_type: 4, filename: '', is_cash: false },
    { expense_id: 15, partner: 'Partner 15', amount: '290.00', date: '2024-01-29', expense_type: 5, filename: '', is_cash: false },
    { expense_id: 16, partner: 'Partner 16', amount: '310.00', date: '2024-01-30', expense_type: 6, filename: '', is_cash: false },
    { expense_id: 17, partner: 'Partner 17', amount: '195.00', date: '2024-01-31', expense_type: 7, filename: '', is_cash: false },
    { expense_id: 18, partner: 'Partner 18', amount: '240.00', date: '2024-02-01', expense_type: 8, filename: '', is_cash: false },
    { expense_id: 19, partner: 'Partner 19', amount: '320.00', date: '2024-02-02', expense_type: 9, filename: '', is_cash: false },
];

export const generateBelegaufstellungHtml = (data: XlsxTemplateData): string => {
    const { applicationName, dataGroupId, expenses, total } = data;
    
    const rows = expenses.slice(0, 19).map((expense, index) => `
        <tr>
            <td style="border: 1px solid #000000;">${index + 1}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.date || ''}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.partner}</td>
            <td style="border: 1px solid #000000; border-left: none; text-align: right;">${expense.is_cash ? '' : parseFloat(expense.amount).toFixed(2)}</td>
            <td style="border: 1px solid #000000; border-left: none; text-align: right;">${expense.is_cash ? parseFloat(expense.amount).toFixed(2) : ''}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.expense_type > 0 ? `Type ${expense.expense_type}` : ''}</td>
        </tr>
    `).join('');

    return `
        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt;">
            <thead>
                <tr>
                    <th colspan="6" style="border: 2px solid #000000; padding: 8px; text-align: center; font-size: 14pt; font-weight: bold; background-color: #D9D9D9;">
                        Belegaufstellung - ${applicationName}
                    </th>
                </tr>
                <tr>
                    <th colspan="6" style="border: 2px solid #000000; border-top: none; padding: 4px; text-align: left;">
                        Datengruppe: ${dataGroupId}
                    </th>
                </tr>
                <tr>
                    <th colspan="6" style="border: 2px solid #000000; border-top: none; padding: 4px; text-align: left;">
                        Summe: € ${total.toFixed(2)}
                    </th>
                </tr>
                <tr>
                    <th colspan="6" style="border: 2px solid #000000; border-top: none; padding: 4px;">&nbsp;</th>
                </tr>
                <tr style="background-color: #D9D9D9;">
                    <th style="border: 1px solid #000000; padding: 4px; width: 30px; text-align: center;">No.</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 70px; text-align: center;">Date</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 150px;">Partner</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 70px; text-align: right;">Bank (€)</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 70px; text-align: right;">Cash (€)</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 100px;">Type</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};

export const getDummyTemplateData = (): XlsxTemplateData => ({
    applicationName: 'BMKOS',
    dataGroupId: 1,
    expenses: DUMMY_EXPENSES,
    total: DUMMY_EXPENSES.reduce((sum, e) => sum + parseFloat(e.amount), 0),
});