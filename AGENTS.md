# Frontend Documentation

## Architecture Overview

This is a React-based single page application (SPA) for the discotec accounting system. It manages expenses, bills, and application reports for funding applications (like BMKOS, MA7, Bezirk).

### Tech Stack
- **React 19.2.0** with TypeScript
- **Vite** — build tool + dev server
- **@tanstack/react-query** — data fetching and caching with optimistic updates
- **axios** — HTTP client for API calls
- **papaparse** — CSV parsing for bulk expense import
- **react-to-print** — PDF generation via browser print dialog
- **xlsx-js-style** — XLSX/Excel file generation
- **98.css** — Windows 98 styling

### Project Structure
```
src/
├── main.tsx                       # Entry point, renders <App /> in StrictMode
├── App.tsx                        # Main app: 3 tabs, QueryClient, data group state
├── index.css                      # Global styles
├── api/
│   ├── client.ts                  # Axios client (base /api), all API functions + interceptors
│   └── types.ts                   # TypeScript interfaces + EXPENSE_TYPES + APPLICATIONS maps
├── assets/
│   └── react.svg
├── components/
│   ├── windows98/
│   │   └── index.tsx              # Reusable Win98 UI: Window, Button, Dialog, Input, Select
│   ├── AddExpenseModal.tsx        # Full-screen modal: manual add, CSV upload/preview/import
│   ├── ApplicationBreakdownPanel.tsx # Right sidebar on Expenses tab: app breakdown
│   ├── ApplicationReportCard.tsx  # Dashboard card for an application report
│   ├── ApplicationReportModal.tsx # Create/edit/delete application reports
│   ├── AssetOverview.tsx          # Bank/cash balance editor under Dashboard > Assets
│   ├── BillExpensesTable.tsx      # Expenses table filtered for Bills view
│   ├── BillSearch.tsx             # Text filter for bills by amount
│   ├── BillsList.tsx              # Standalone bills list (not currently wired in App.tsx)
│   ├── BillsView.tsx              # Main Bills tab: bill list, editor, expense table
│   ├── BreakdownTable.tsx         # Reusable expense type breakdown table
│   ├── DashboardView.tsx          # Dashboard tab: reports, EAR, asset overview
│   ├── DataGroupSelector.tsx      # Toolbar: select / create / delete data groups
│   ├── ExpenseSearch.tsx          # Filter toolbar: partner, month, type, bill status
│   ├── ExpensesTable.tsx          # Main expenses table (Expenses tab)
│   ├── SummaryPanel.tsx           # Legacy summary panel (not currently in App.tsx)
│   ├── Tooltip.tsx                # Mouse-following tooltip
│   └── UploadBillsModal.tsx       # File/folder upload modal for bills
├── hooks/
│   ├── useApplicationReports.ts   # CRUD hooks for application reports
│   ├── useBills.ts                # CRUD hooks for bills (optimistic updates)
│   ├── useDataGroups.ts           # CRUD hooks for data groups
│   ├── useExpenseFilter.ts        # Client-side expense filtering (no API calls)
│   ├── useExpenses.ts             # CRUD hooks for expenses (optimistic updates)
│   ├── useReports.ts              # useEar() + useExpensesWithBills()
│   ├── useSummaries.ts            # Fetch summaries grouped by application
│   └── useUtilityData.ts          # Bank/cash stand get/save
├── styles/
│   └── overrides.css              # Additional CSS overrides for 98.css
└── utils/
    ├── xlsxTemplate.ts            # HTML generation for Belegaufstellung
    └── xlsxExport.ts              # HTML-to-XLSX conversion + EAR CSV export
```

### Main Features

#### 1. Tabs
The app has three main tabs:
- **Expenses** — manage individual expenses, bulk CSV import
- **Bills** — upload and manage bill receipts (images/PDFs)
- **Dashboard** — view reports, EAR, asset overview, generate exports

#### 2. Data Groups
Expenses, application reports and bills are organized by data groups (projects or organizations). The selected data group persists in localStorage under key `lastUsedDataGroupId`. On app load, if the saved group no longer exists, it falls back to the first available group.

#### 3. Reports
- **Application Reports** — funding applications with target amounts. Expenses and bills can be assigned to application reports.
- **EAR (Einnahmen Ausgaben Rechnung)** — income/expense summary split by bank vs cash.

#### 4. CSV Import (Expenses tab)
The `+` button on the Expenses tab opens `AddExpenseModal` which supports:
- **Manual entry** — partner, amount, date, type, bill, application, cash
- **CSV upload** — parse with Papa Parse, auto-detect columns and date format, preview with validation highlighting, bulk insert via `POST /api/expenses/bulk`

### Report Generation

#### PDF Export (EAR)
- Uses `react-to-print` hook
- Opens browser print dialog
- User selects "Save as PDF" to download

#### XLSX Export (Application Reports)
- Uses `xlsx-js-style` library
- Generates HTML template with expense rows via `generateBelegaufstellungHtml()`
- Converts HTML to XLSX and triggers browser download

#### CSV Export (EAR)
- `exportEarToCsv()` in `xlsxExport.ts` — generates a CSV with date-sorted expenses (bank/cash split) and Schlussbilanz footer

### Key Files

#### `api/client.ts`
Axios instance with request/response console logging interceptors. Base URL from `VITE_API_BASE_URL` env var (falls back to `http://localhost:8080/api`). Exports ~25 API functions — all data queries require `data_group` parameter.

#### `api/types.ts`
TypeScript interfaces for all entities (`Bill`, `Expense`, `Summary`, `DataGroup`, `ApplicationReport`, `BelegaufstellungItem`, etc.) plus constant maps:
- `EXPENSE_TYPES` (Record<number, string>) — 28 entries mapping type IDs to German labels. Types 0-19 are expense categories, types 50-56 are income categories.
- `APPLICATIONS` (Record<number, string>) — 0="-", 1="BMKOS", 2="MA7", 3="Bezirk"

#### `components/windows98/index.tsx`
Reusable Win98-style primitives used throughout the app: `Window`, `Button`, `Dialog` (modal confirmation/alert with icon), `Input` (controlled), `Select` (controlled).

#### xlsxTemplate.ts
Generates the HTML table for the Belegaufstellung (application report):
- Styled header with application name, data group, and total
- Data rows with expense details
- Uses inline CSS for borders, fonts, colors

#### xlsxExport.ts
Three export functions:
- `exportEarToCsv()` — EAR as downloadable CSV
- `convertHtmlToXlsx()` — HTML table to XLSX via `xlsx-js-style`
- `exportTemplateToXlsx()` — uses dummy data (dev helper)

### Data Fetching Patterns
- **React Query config:** `retry: 1`, `refetchOnWindowFocus: false` (set in App.tsx)
- **Optimistic updates:** Used for bill updates (`useBills.ts`) and expense field updates (`useExpenses.ts`). Pattern: cancel queries → optimistically update cache → rollback on error → invalidate on settle.
- **Query keys** follow `['resourceName', groupId]` convention
- `staleTime: 0` for bills and expenses to ensure fresh data

### Button Naming
- EAR section: "View Report" / "Print Report" — PDF flow
- Application cards: "View Belegaufstellung" / "Print Belegaufstellung" — XLSX flow

### Vite Configuration
- Plugin: `@vitejs/plugin-react`
- Dev server proxy: `/api` → `http://localhost:8080` with `changeOrigin: true`
- In dev mode, all `/api` requests go through the Vite proxy. In production, `VITE_API_BASE_URL` is used directly.

### API Notes
- Frontend calls backend at `http://localhost:8080/api` (via Vite proxy in dev)
- All 26 backend endpoints are active (including `/api/reports` for Belegaufstellung items)
- Backend must be running for the frontend to work

### Styling
The app uses Windows 98 aesthetic with:
- Teal desktop background (`#008080`)
- Gray UI backgrounds (`#c0c0c0`)
- outset/inset borders for 3D effects
- Native browser scrollbars
- Custom overrides in `styles/overrides.css`

### Development Commands
```bash
bun install       # Install dependencies (uses bun.lock)
bun run dev       # Start dev server (port 5173)
bun run build     # Type-check (tsc -b) + build (vite build)
bun run lint      # Run ESLint
bun run preview   # Preview production build
```
