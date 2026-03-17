import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApplicationReports, 
  createApplicationReport, 
  updateApplicationReport, 
  deleteApplicationReport 
} from '../api/client';

const APPLICATION_REPORTS_KEY = 'application_reports';

export const useApplicationReports = (groupId: number) => {
  return useQuery({
    queryKey: [APPLICATION_REPORTS_KEY, groupId],
    queryFn: () => getApplicationReports(groupId),
    enabled: groupId > 0,
  });
};

export const useCreateApplicationReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      amount: number;
      submission_deadline?: string;
      group_id: number;
    }) => createApplicationReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPLICATION_REPORTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
  });
};

export const useUpdateApplicationReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      data
    }: { 
      id: number; 
      data: { name?: string; amount?: number; submission_deadline?: string | null };
    }) => updateApplicationReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPLICATION_REPORTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
  });
};

export const useDeleteApplicationReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => 
      deleteApplicationReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPLICATION_REPORTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
  });
};
