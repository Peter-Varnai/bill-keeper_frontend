import React from 'react';
import { EXPENSE_TYPES } from '../api/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ExpenseSearchProps {
    searchName: string;
    onSearchNameChange: (name: string) => void;
    selectedMonth: number | null;
    onMonthChange: (month: number | null) => void;
    selectedExpenseType: number | null;
    onExpenseTypeChange: (type: number | null) => void;
    billFilter: 'all' | 'yes' | 'no';
    onBillFilterChange: (filter: 'all' | 'yes' | 'no') => void;
}

export const ExpenseSearch: React.FC<ExpenseSearchProps> = ({
    searchName,
    onSearchNameChange,
    selectedMonth,
    onMonthChange,
    selectedExpenseType,
    onExpenseTypeChange,
    billFilter,
    onBillFilterChange,
}) => {
    const expenseTypeOptions = [
        { value: -1, label: 'All Types' },
        { value: -2, label: '──────────' },
        ...Object.entries(EXPENSE_TYPES).map(([value, label]) => ({
            value: Number(value),
            label,
        })),
    ];

    return (
        <div style={{ padding: '8px', borderBottom: '2px solid #808080', backgroundColor: '#c0c0c0' }}>
            <div style={{ marginBottom: '8px' }}>
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => onSearchNameChange(e.target.value)}
                    placeholder="Search by partner name..."
                    style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '2px inset #fff',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box',
                    }}
                />
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {MONTHS.map((month, index) => {
                    const monthNum = index + 1;
                    const isSelected = selectedMonth === monthNum;
                    return (
                        <button
                            key={month}
                            onClick={() => onMonthChange(isSelected ? null : monthNum)}
                            style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                border: isSelected ? '2px inset #808080' : '2px outset #fff',
                                backgroundColor: isSelected ? '#d4d0c8' : '#c0c0c0',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 'bold' : 'normal',
                            }}
                        >
                            {month}
                        </button>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '11px' }}>Type:</label>
                    <select
                        value={selectedExpenseType ?? -1}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            onExpenseTypeChange(val === -1 ? null : val);
                        }}
                        style={{
                            fontSize: '11px',
                            padding: '2px 4px',
                            border: '2px inset #fff',
                            backgroundColor: '#fff',
                        }}
                    >
                        {expenseTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.value <= 0}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '11px' }}>Bill:</label>
                    <select
                        value={billFilter}
                        onChange={(e) => onBillFilterChange(e.target.value as 'all' | 'yes' | 'no')}
                        style={{
                            fontSize: '11px',
                            padding: '2px 4px',
                            border: '2px inset #fff',
                            backgroundColor: '#fff',
                        }}
                    >
                        <option value="all">All</option>
                        <option value="yes">Has Bill</option>
                        <option value="no">No Bill</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
