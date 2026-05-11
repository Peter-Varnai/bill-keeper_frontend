import * as XLSX from 'xlsx-js-style';

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