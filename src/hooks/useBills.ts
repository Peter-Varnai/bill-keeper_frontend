import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBills, getBill, updateBill, uploadBills, deleteBill } from '../api/client';
import type { Bill } from '../api/types';

const BILLS_KEY = 'bills';

export const useBills = (groupId: number) => {
  return useQuery({
    queryKey: [BILLS_KEY, groupId],
    queryFn: async () => {
      console.log('[useBills] Fetching bills for groupId:', groupId);
      const result = await getBills(groupId);
      console.log('[useBills] Got bills:', result.length, 'for groupId:', groupId);
      return result;
    },
    enabled: groupId > 0,
    staleTime: 0,
  });
};

export const useBill = (id: number, groupId: number) => {
  return useQuery({
    queryKey: [BILLS_KEY, id, groupId],
    queryFn: () => getBill(id, groupId),
    enabled: !!id && groupId > 0,
  });
};

export const useUpdateBill = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bill }: { id: number; bill: Partial<Bill> }) =>
      updateBill(id, bill, groupId),
    onMutate: async ({ id, bill }) => {
      await queryClient.cancelQueries({ queryKey: [BILLS_KEY, groupId] });
      const previousBills = queryClient.getQueryData<Bill[]>([BILLS_KEY, groupId]);

      queryClient.setQueryData<Bill[]>([BILLS_KEY, groupId], (old) => {
        if (!old) return old;
        return old.map((b) =>
          b.id === id ? { ...b, ...bill } : b
        );
      });

      return { previousBills };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBills) {
        queryClient.setQueryData([BILLS_KEY, groupId], context.previousBills);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY, groupId] });
    },
  });
};

export const useUploadBills = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => uploadBills(files, groupId),
    onSuccess: () => {
      // Invalidate and refetch bills after successful upload
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY, groupId] });
    },
  });
};

// Delete bill
export const useDeleteBill = (groupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteBill(id, groupId),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [BILLS_KEY, groupId] });

      // Snapshot previous value
      const previousBills = queryClient.getQueryData<Bill[]>([BILLS_KEY, groupId]);

      // Optimistically remove the bill by filtering it out
      queryClient.setQueryData<Bill[]>([BILLS_KEY, groupId], (old) => {
        if (!old) return old;
        return old.filter((bill) => bill.id !== id);
      });

      return { previousBills };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error - restore the deleted bill
      if (context?.previousBills) {
        queryClient.setQueryData([BILLS_KEY, groupId], context.previousBills);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: [BILLS_KEY, groupId] });
    },
  });
};