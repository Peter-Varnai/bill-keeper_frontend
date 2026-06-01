import { useMemo } from 'react';
import type { Expense } from '../api/types';

export interface ExpenseFilterState {
    searchName: string;
    selectedMonth: number | null;
    selectedExpenseType: number | null;
    billFilter: 'all' | 'yes' | 'no';
}

export const useExpenseFilter = (expenses: Expense[] | undefined, filter: ExpenseFilterState) => {
    return useMemo(() => {
        if (!expenses) return [];

        let filtered = expenses;

        // Filter by name (partner)
        if (filter.searchName.trim()) {
            const searchLower = filter.searchName.toLowerCase();
            filtered = filtered.filter(expense =>
                expense.partner.toLowerCase().includes(searchLower)
            );
        }

        // Filter by month
        if (filter.selectedMonth !== null) {
            filtered = filtered.filter(expense => {
                if (!expense.date) return false;
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() + 1 === filter.selectedMonth;
            });
        }

        // Filter by expense type
        if (filter.selectedExpenseType !== null) {
            filtered = filtered.filter(expense =>
                expense.expense_type === filter.selectedExpenseType
            );
        }

        // Filter by bill status
        if (filter.billFilter !== 'all') {
            filtered = filtered.filter(expense => {
                const hasBill = expense.bill !== null && expense.bill !== 0;
                if (filter.billFilter === 'yes') {
                    return hasBill;
                } else {
                    return !hasBill;
                }
            });
        }

        return filtered;
    }, [expenses, filter.searchName, filter.selectedMonth, filter.selectedExpenseType, filter.billFilter]);
};
