import React, { useState } from 'react';
import { useExpenses, useUpdateExpenseBill } from '../hooks/useExpenses';
import { Window } from './windows98';
import { ExpenseSearch } from './ExpenseSearch';
import { useExpenseFilter } from '../hooks/useExpenseFilter';
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

export const BillExpensesTable: React.FC<BillExpensesTableProps> = ({ dataGroupId }) => {
    const { data: expenses, isLoading, error } = useExpenses(dataGroupId);
    const updateBill = useUpdateExpenseBill(dataGroupId);

    // Search state
    const [searchName, setSearchName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    // Filter expenses
    const filteredExpenses = useExpenseFilter(expenses, { searchName, selectedMonth });

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
                />
                <div style={{ overflow: 'auto', flex: 1 }}>
                    <table className="table" style={{ width: '100%', fontSize: '14px', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                <th style={stickyHeaderStyle}>Partner</th>
                                <th style={stickyHeaderStyle}>Amount</th>
                                <th style={stickyHeaderStyle}>Date</th>
                                <th style={stickyHeaderStyle}>Bill #</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense: Expense) => (
                                <tr key={expense.id}>
                                    <td style={{
                                        color: parseFloat(String(expense.amount)) > 0 ? '#2e7d32' :
                                            expense.bill === 0 && parseFloat(String(expense.amount)) < 0 ? '#f57c00' : undefined,
                                    }}>{expense.partner}</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {parseFloat(String(expense.amount)) > 0 ? '+' : ''}€ {parseFloat(String(expense.amount)).toFixed(2)}
                                    </td>
                                    <td>{expense.date || '-'}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={expense.bill === null || expense.bill === 0 ? "" : expense.bill}
                                            onChange={(e) =>
                                                updateBill.mutate({
                                                    id: expense.id,
                                                    billNumber: Number(e.target.value),
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
