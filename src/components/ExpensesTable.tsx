import React, { useState } from 'react';
import { useExpenses, useUpdateExpenseBill, useUpdateExpenseType, useUpdateExpenseApplication, useUpdateExpenseCash, useDeleteExpense } from '../hooks/useExpenses';
import { useApplicationReports } from '../hooks/useApplicationReports';
import { Window, Select, Dialog } from './windows98';
import { ExpenseSearch } from './ExpenseSearch';
import { useExpenseFilter } from '../hooks/useExpenseFilter';
import { EXPENSE_TYPES } from '../api/types';
import type { Expense } from '../api/types';

// Helper function to get expense type options based on amount
const getExpenseTypeOptions = (amount: number) => {
    if (amount === 0) return []; // No options when amount is 0

    return Object.entries(EXPENSE_TYPES)
        .filter(([key]) => {
            const num = Number(key);
            if (amount > 0) {
                // Positive amounts: None (0) + income categories (50-56)
                return num === 0 || (num >= 50 && num <= 56);
            } else {
                // Negative amounts: expense categories (0-19)
                return num >= 0 && num <= 19;
            }
        })
        .map(([value, label]) => ({
            value: Number(value),
            label,
        }));
};

interface ExpensesTableProps {
    onExpenseClick?: (expense: Expense) => void;
    dataGroupId: number;
}

const stickyHeaderStyle = {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#c0c0c0',
    borderBottom: '2px solid #808080',
    zIndex: 5,
};

export const ExpensesTable: React.FC<ExpensesTableProps> = ({ onExpenseClick, dataGroupId }) => {
    const { data: expenses, isLoading, error } = useExpenses(dataGroupId);
    const { data: applicationReports } = useApplicationReports(dataGroupId);
    const updateBill = useUpdateExpenseBill(dataGroupId);
    const updateType = useUpdateExpenseType(dataGroupId);
    const updateApplication = useUpdateExpenseApplication(dataGroupId);
    const updateCash = useUpdateExpenseCash(dataGroupId);
    const deleteExpense = useDeleteExpense(dataGroupId);

    // Build application options from dynamic application reports
    const applicationOptions = [
        { value: 0, label: '-' },
        ...(applicationReports || []).map((app) => ({
            value: app.id,
            label: app.name,
        })),
    ];

    // State for delete confirmation dialog
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

    const handleDeleteClick = (e: React.MouseEvent, expense: Expense) => {
        e.stopPropagation(); // Prevent row click from triggering
        setExpenseToDelete(expense);
    };

    const handleConfirmDelete = () => {
        if (expenseToDelete) {
            deleteExpense.mutate({ id: expenseToDelete.id });
            setExpenseToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setExpenseToDelete(null);
    };

    return (
        <Window title="Expenses" style={{ height: 'calc(100vh - 80px)' }}>
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ExpenseSearch
                    searchName={searchName}
                    onSearchNameChange={setSearchName}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
                <div style={{ overflow: 'auto', flex: 1 }}>
                    <table className="table" style={{ width: '100%', fontSize: '18px', borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr>
                                <th style={stickyHeaderStyle}>Partner</th>
                                <th style={stickyHeaderStyle}>Amount</th>
                                <th style={stickyHeaderStyle}>Bill #</th>
                                <th style={stickyHeaderStyle}>Type</th>
                                <th style={stickyHeaderStyle}>Application</th>
                                <th style={stickyHeaderStyle}>Date</th>
                                <th style={stickyHeaderStyle}>Cash</th>
                                <th style={{ ...stickyHeaderStyle, width: '35px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense: Expense) => (
                                <tr
                                    key={expense.id}
                                    onClick={() => onExpenseClick?.(expense)}
                                    style={{
                                        cursor: onExpenseClick ? 'pointer' : 'default',
                                    }}>
                                    <td style={{
                                        color: expense.amount > 0 ? '#2e7d32' :
                                            expense.bill === 0 && expense.amount < 0 ? '#f57c00' : undefined,
                                    }}>{expense.partner}</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {expense.amount > 0 ? '+' : ''}€ {expense.amount.toFixed(2)}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={expense.bill === 0 ? "-" : expense.bill}
                                            onChange={(e) =>
                                                updateBill.mutate({
                                                    id: expense.id,
                                                    billNumber: Number(e.target.value),
                                                })
                                            }
                                            style={{ width: '60px', fontSize: '13px' }}
                                            min={0}
                                            max={999}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            value={expense.expense_type}
                                            onChange={(value: string) =>
                                                updateType.mutate({
                                                    id: expense.id,
                                                    typeId: Number(value),
                                                })
                                            }
                                            options={getExpenseTypeOptions(expense.amount)}
                                            disabled={expense.amount === 0}
                                            style={{ width: '200px', fontSize: '13px' }}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            value={expense.application || 0}
                                            onChange={(value: string) =>
                                                updateApplication.mutate({
                                                    id: expense.id,
                                                    appId: Number(value),
                                                })
                                            }
                                            options={applicationOptions}
                                            style={{ width: '100px', fontSize: '12px' }}
                                        />
                                    </td>
                                    <td>{expense.date || '-'}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={expense.Bargeldabhebung || false}
                                            onChange={(e) =>
                                                updateCash.mutate({
                                                    id: expense.id,
                                                    isCash: e.target.checked,
                                                })
                                            }
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, expense)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                            }}
                                            title="Delete expense"
                                            className="delete-expense-button"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Dialog
                title="Delete Expense"
                message={expenseToDelete
                    ? `Are you sure you want to delete the expense for "${expenseToDelete.partner}" (€${expenseToDelete.amount.toFixed(2)})? This action cannot be undone.`
                    : ''
                }
                isOpen={!!expenseToDelete}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                type="warning"
            />
        </Window>
    );
};
