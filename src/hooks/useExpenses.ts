import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExpenses, updateExpenseBill, updateExpenseType, updateExpenseApplication, updateExpenseCash, createExpense, bulkImportExpenses, deleteExpense } from '../api/client';
import type { Expense } from '../api/types';

const EXPENSES_KEY = 'expenses';

export const useExpenses = (groupId: number) => {
    return useQuery({
        queryKey: [EXPENSES_KEY, groupId],
        queryFn: () => getExpenses(groupId),
        enabled: groupId > 0,
    });
};

export const useUpdateExpenseBill = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, billNumber }: { id: number; billNumber: number }) =>
            updateExpenseBill(id, billNumber, groupId),
        onMutate: async ({ id, billNumber }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY, groupId] });

            // Snapshot previous value
            const previousExpenses = queryClient.getQueryData<Expense[]>([EXPENSES_KEY, groupId]);

            // Optimistically update
            queryClient.setQueryData<Expense[]>([EXPENSES_KEY, groupId], (old) => {
                if (!old) return old;
                return old.map((expense) =>
                    expense.id === id ? { ...expense, bill: billNumber } : expense
                );
            });

            return { previousExpenses };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousExpenses) {
                queryClient.setQueryData([EXPENSES_KEY, groupId], context.previousExpenses);
            }
        },
        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};

export const useUpdateExpenseType = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, typeId }: { id: number; typeId: number }) =>
            updateExpenseType(id, typeId, groupId),
        onMutate: async ({ id, typeId }) => {
            await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY, groupId] });
            const previousExpenses = queryClient.getQueryData<Expense[]>([EXPENSES_KEY, groupId]);

            queryClient.setQueryData<Expense[]>([EXPENSES_KEY, groupId], (old) => {
                if (!old) return old;
                return old.map((expense) =>
                    expense.id === id ? { ...expense, expense_type: typeId } : expense
                );
            });

            return { previousExpenses };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousExpenses) {
                queryClient.setQueryData([EXPENSES_KEY, groupId], context.previousExpenses);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};

export const useUpdateExpenseApplication = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, appId }: { id: number; appId: number }) =>
            updateExpenseApplication(id, appId, groupId),
        onMutate: async ({ id, appId }) => {
            await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY, groupId] });
            const previousExpenses = queryClient.getQueryData<Expense[]>([EXPENSES_KEY, groupId]);

            queryClient.setQueryData<Expense[]>([EXPENSES_KEY, groupId], (old) => {
                if (!old) return old;
                return old.map((expense) =>
                    expense.id === id ? { ...expense, application: appId } : expense
                );
            });

            return { previousExpenses };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousExpenses) {
                queryClient.setQueryData([EXPENSES_KEY, groupId], context.previousExpenses);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};

export const useUpdateExpenseCash = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isCash }: { id: number; isCash: boolean }) =>
            updateExpenseCash(id, isCash, groupId),
        onMutate: async ({ id, isCash }) => {
            await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY, groupId] });
            const previousExpenses = queryClient.getQueryData<Expense[]>([EXPENSES_KEY, groupId]);

            queryClient.setQueryData<Expense[]>([EXPENSES_KEY, groupId], (old) => {
                if (!old) return old;
                return old.map((expense) =>
                    expense.id === id ? { ...expense, is_cash: isCash } : expense
                );
            });

            return { previousExpenses };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousExpenses) {
                queryClient.setQueryData([EXPENSES_KEY, groupId], context.previousExpenses);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};

// Create single expense
export const useCreateExpense = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (expense: {
            partner: string;
            amount: string;
            date?: string;
            expense_type?: number;
            bill?: number;
            application?: number;
            is_cash?: boolean;
        }) => createExpense(expense, groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};

// Bulk import expenses from CSV
export const useBulkImportExpenses = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            data_group: number;
            date_format: string;
            rows: Array<{ partner: string; amount: number; date: string; row_number: number }>;
        }) => bulkImportExpenses(data, data.data_group),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
        },
    });
};

// Delete expense
export const useDeleteExpense = (groupId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number }) => deleteExpense(id, groupId),
        onMutate: async ({ id }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY, groupId] });

            // Snapshot previous value
            const previousExpenses = queryClient.getQueryData<Expense[]>([EXPENSES_KEY, groupId]);

            // Optimistically remove the expense by filtering it out
            queryClient.setQueryData<Expense[]>([EXPENSES_KEY, groupId], (old) => {
                if (!old) return old;
                return old.filter((expense) => expense.id !== id);
            });

            return { previousExpenses };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error - restore the deleted expense
            if (context?.previousExpenses) {
                queryClient.setQueryData([EXPENSES_KEY, groupId], context.previousExpenses);
            }
        },
        onSettled: () => {
            // Refetch to ensure sync with server
            queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, groupId] });
        },
    });
};
