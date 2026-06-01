import * as XLSX from 'xlsx-js-style';
import type { EarResponse } from '../api/types';
import { EXPENSE_TYPES } from '../api/types';

export const exportEarToCsv = (earData: EarResponse, dataGroupId: number): void => {
    const rows: string[] = [];

    rows.push('"Einnahmen Ausgaben Rechnung"');
    rows.push(`"Datengruppe: ${dataGroupId}"`);
    rows.push('');

    rows.push('Date,Partner,Bank (€),Cash (€),Type');

    const sortedExpenses = [...earData.expenses].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
    });

    sortedExpenses.forEach((expense) => {
        const bankAmount = !expense.is_cash ? parseFloat(String(expense.amount)).toFixed(2) : '';
        const cashAmount = expense.is_cash ? parseFloat(String(expense.amount)).toFixed(2) : '';
        const typeName = EXPENSE_TYPES[expense.expense_type] || 'Unknown';
        rows.push(`${expense.date || ''},"${expense.partner}",${bankAmount},${cashAmount},"${typeName}"`);
    });

    rows.push(`,,Schlussbilanz,${earData.totals.bank_total},${earData.totals.cash_total},`);

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EAR_${dataGroupId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const convertHtmlToXlsx = (html: string, filename: string): void => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) {
        console.error('No table found in HTML');
        return;
    }

    const worksheet = XLSX.utils.table_to_sheet(table);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Belegaufstellung');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportTemplateToXlsx = (filename: string): void => {
    const { generateBelegaufstellungHtml, getDummyTemplateData } = require('./xlsxTemplate');
    const templateData = getDummyTemplateData();
    const html = generateBelegaufstellungHtml(templateData);
    convertHtmlToXlsx(html, filename);
};