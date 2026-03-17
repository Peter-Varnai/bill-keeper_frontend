# Accounting Application - Frontend

A React + TypeScript application for managing accounting data with a Windows 98 aesthetic. The application connects to a Rust backend API and provides interfaces for expense tracking, bill management, and financial reporting.

## Features

- **Expense Management**: Edit expense types, applications, and cash designations
- **Bill Processing**: Upload and annotate bill images with amounts and dates
- **Dashboard**: View financial summaries and generate printable reports
- **EAR (Einnahmen Ausgaben Rechnung)**: Track income and expenses with bank/cash breakdown
- **Windows 98 UI**: Authentic Windows 98 styling using 98.css

## Architecture

The application follows a clean architecture with clear separation of concerns:

- **API Layer**: Type-safe HTTP communication with backend
- **Hooks Layer**: React Query for server state management
- **Components Layer**: Reusable UI components with local state

For detailed architecture documentation, see [REACT_ARCHITECTURE.md](./REACT_ARCHITECTURE.md).

## Project Structure

```
src/
├── api/                    # API communication layer
│   ├── client.ts          # Axios HTTP client
│   └── types.ts           # TypeScript interfaces
├── hooks/                 # Custom React hooks
│   ├── useBills.ts        # Bill data fetching
│   ├── useExpenses.ts     # Expense data fetching
│   ├── useReports.ts      # Report data fetching
│   └── useSummaries.ts    # Summary data fetching
├── components/            # UI components
│   ├── App.tsx            # Main application
│   ├── DashboardView.tsx  # Dashboard interface
│   ├── ExpensesTable.tsx  # Expense management
│   ├── BillsView.tsx      # Bill editing
│   └── windows98/         # Windows 98 components
└── styles/                # CSS overrides
```

## State Management

- **Local State**: Component-specific UI state (useState)
- **Server State**: Backend data (React Query with optimistic updates)
- **Global State**: Minimal, using React Query shared cache

## Key Technologies

- **React 19**: Modern React with hooks
- **TypeScript**: Type safety and developer experience
- **React Query**: Server state management with caching
- **98.css**: Windows 98 CSS framework
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication

## Development

### Prerequisites
- Node.js 18+ and npm
- Rust backend running (see backend README)

### Installation
```bash
npm install
```

### Running the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or your configured port).

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Backend Integration

The frontend expects a Rust backend running at `http://localhost:8080` (or configured via `VITE_API_BASE_URL` environment variable). The backend provides:

- Expense CRUD operations
- Bill image upload and management
- Financial summaries and reports
- EAR (income/expense) calculations

## Environment Variables

Create a `.env` file in the frontend root:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Learn More

For comprehensive documentation on the React architecture, patterns, and state management, see [REACT_ARCHITECTURE.md](./REACT_ARCHITECTURE.md).

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
