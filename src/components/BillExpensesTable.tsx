import React, { useState } from 'react';
import { useExpenses, useUpdateExpenseBill, useUpdateExpenseType } from '../hooks/useExpenses';
import { Window, Select } from './windows98';
import { ExpenseSearch } from './ExpenseSearch';
import { useExpenseFilter } from '../hooks/useExpenseFilter';
import { EXPENSE_TYPES } from '../api/types';
import type { Expense } from '../api/types';

interface BillExpensesTableProps {
    dataGroupId: number;
}

const stickyHeaderStyle = {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#c0c0c0',
    borderBottom: '2px solid #808080',
    zIndex: 5,
};

const getExpenseTypeOptions = (amount: number) => {
    if (amount === 0) return [];
    return Object.entries(EXPENSE_TYPES)
        .filter(([key]) => {
            const num = Number(key);
            if (amount > 0) return num === 0 || (num >= 50 && num <= 56);
            return num >= 0 && num <= 19;
        })
        .map(([value, label]) => ({ value: Number(value), label }));
};

export const BillExpensesTable: React.FC<BillExpensesTableProps> = ({ dataGroupId }) => {
    const { data: expenses, isLoading, error } = useExpenses(dataGroupId);
    const updateBill = useUpdateExpenseBill(dataGroupId);
    const updateType = useUpdateExpenseType(dataGroupId);

    // Search state
    const [searchName, setSearchName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedExpenseType, setSelectedExpenseType] = useState<number | null>(null);
    const [billFilter, setBillFilter] = useState<'all' | 'yes' | 'no'>('all');

    // Filter expenses
    const filteredExpenses = useExpenseFilter(expenses, {
        searchName,
        selectedMonth,
        selectedExpenseType,
        billFilter,
    });

    if (isLoading) {
        return (
            <Window title="Expenses" style={{ margin: '8px' }}>
                <div style={{ padding: '16px' }}>Loading expenses...</div>
            </Window>
        );
    }

    if (error) {
        return (
            <Window title="Expenses" style={{ margin: '8px' }}>
                <div style={{ padding: '16px', color: 'red' }}>
                    Error loading expenses: {error.message}
                </div>
            </Window>
        );
    }

    return (
        <Window title="Expenses" style={{ height: '100%' }}>
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ExpenseSearch
                    searchName={searchName}
                    onSearchNameChange={setSearchName}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    selectedExpenseType={selectedExpenseType}
                    onExpenseTypeChange={setSelectedExpenseType}
                    billFilter={billFilter}
                    onBillFilterChange={setBillFilter}
                />
                <div style={{ overflow: 'auto', flex: 1 }}>
                    <table className="table" style={{ width: '100%', fontSize: '14px', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                <th style={stickyHeaderStyle}>Partner</th>
                                <th style={stickyHeaderStyle}>Amount</th>
                                <th style={stickyHeaderStyle}>Date</th>
                                <th style={stickyHeaderStyle}>Expense Type</th>
                                <th style={stickyHeaderStyle}>Bill #</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense: Expense) => (
                                <tr key={expense.id}>
                                    <td style={{
                                        color: parseFloat(String(expense.amount)) > 0 ? '#2e7d32' :
                                            expense.bill === null && parseFloat(String(expense.amount)) < 0 ? '#f57c00' : undefined,
                                    }}>{expense.partner}</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {parseFloat(String(expense.amount)) > 0 ? '+' : ''}€ {parseFloat(String(expense.amount)).toFixed(2)}
                                    </td>
                                    <td>{expense.date || '-'}</td>
                                    <td>
                                        <Select
                                            value={expense.expense_type}
                                            onChange={(value: string) =>
                                                updateType.mutate({
                                                    id: expense.id,
                                                    typeId: Number(value),
                                                })
                                            }
                                            options={getExpenseTypeOptions(Number(expense.amount))}
                                            disabled={Number(expense.amount) === 0}
                                            style={{ width: '200px', fontSize: '12px' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={expense.bill === null ? "" : expense.bill}
                                            onChange={(e) =>
                                                updateBill.mutate({
                                                    id: expense.id,
                                                    billNumber: Number(e.target.value) || null,
                                                })
                                            }
                                            style={{ width: '60px', fontSize: '12px' }}
                                            min={0}
                                            max={999}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Window>
    );
};
