import type { ReportItem } from '../api/types';

export interface XlsxTemplateData {
    applicationName: string;
    dataGroupId: number;
    expenses: ReportItem[];
    total: number;
}

export const generateBelegaufstellungHtml = (data: XlsxTemplateData): string => {
    const { applicationName, dataGroupId, expenses, total } = data;
    
    const rows = expenses.map((expense) => `
        <tr>
            <td style="border: 1px solid #000000;">${expense.bill_id ?? ''}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.expense_type_name || ''}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.partner}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.bill_date || ''}</td>
            <td style="border: 1px solid #000000; border-left: none; text-align: right;">${parseFloat(expense.amount).toFixed(2)}</td>
            <td style="border: 1px solid #000000; border-left: none;">${expense.date || ''}</td>
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
                    <th style="border: 1px solid #000000; padding: 4px; width: 60px; text-align: center;">Bill ID</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 150px;">Type</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 150px;">Partner</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 80px; text-align: center;">Bill Date</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 80px; text-align: right;">Amount (€)</th>
                    <th style="border: 1px solid #000000; border-left: none; padding: 4px; width: 80px; text-align: center;">Expense Date</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
};