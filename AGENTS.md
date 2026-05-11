# Frontend Documentation

## Architecture Overview

This is a React-based single page application (SPA) for the discotec accounting system. It manages expenses, bills, and application reports for funding applications (like BMKOS, MA7, Bezirk).

### Tech Stack
- **React 19.2.0** with TypeScript
- **Vite** - build tool
- **@tanstack/react-query** - data fetching and caching
- **axios** - HTTP client for API calls
- **react-to-print** - PDF generation via browser print dialog
- **xlsx-js-style** - XLSX/Excel file generation
- **98.css** - Windows 98 styling

### Project Structure
```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Main app with tab navigation
├── api/
│   ├── client.ts           # Axios API client with interceptors
│   └── types.ts            # TypeScript interfaces + EXPENSE_TYPES
├── components/             # React components
│   ├── ApplicationReportCard.tsx
│   ├── ApplicationReportModal.tsx
│   ├── BillsView.tsx
│   ├── BreakdownTable.tsx
│   ├── DashboardView.tsx    # Main dashboard with reports
│   ├── DataGroupSelector.tsx
│   ├── ExpensesTable.tsx
│   └── ...
├── hooks/                   # React Query hooks
│   ├── useExpenses.ts
│   ├── useBills.ts
│   ├── useSummaries.ts
│   └── useReports.ts
└── utils/
    ├── xlsxTemplate.ts     # HTML template for XLSX export
    └── xlsxExport.ts       # XLSX conversion and download
```

### Main Features

#### 1. Tabs
The app has three main tabs:
- **Expenses** - manage individual expenses
- **Bills** - upload and manage bill receipts
- **Dashboard** - view reports and generate exports

#### 2. Data Groups
 Expenses, application reports and bills are organized by data groups (projects or organizations). The selected data group persists in localStorage.

#### 3. Reports
- **Application Reports** - funding applications with target amounts. The app allows expenses and bills to be assigned to application reports. 
- **EAR (Einnahmen Ausgaben Rechnung)** - income/expense summary



### Report Generation

#### PDF Export (EAR)
- Uses `react-to-print` hook
- Opens browser print dialog
- User selects "Save as PDF" to download

#### XLSX Export (Application Reports)
- Uses `xlsx-js-style` library
- Generates HTML template with 19 rows
- Converts to XLSX and triggers browser download

### Key Files

#### xlsxTemplate.ts
Generates the HTML table for the Belegaufstellung (application report):
- Styled header with application name, data group, and total
- 19 data rows with expense details
- Uses inline CSS for borders, fonts, colors

#### xlsxExport.ts
Converts HTML to XLSX:
- Parses HTML table using `XLSX.utils.table_to_sheet`
- Creates workbook and triggers download

### Button Naming
- EAR section: "View Report" / "Print Report" - PDF flow (unchanged)
- Application cards: "View Belegaufstellung" / "Print Belegaufstellung" - XLSX flow

### API Notes
- Frontend calls backend at `http://localhost:8080/api`
- Some routes are commented out pending backend implementation:
  - `/reports` (getReportByApplicationReport)
- Dummy data is used for XLSX template development

### Styling
The app uses Windows 98 aesthetic with:
- Gray backgrounds (#c0c0c0)
- outset/inset borders for 3D effects
- Native browser scrollbars

### Development Commands
```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run lint    # Run ESLint
```
