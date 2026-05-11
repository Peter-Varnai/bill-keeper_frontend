import { useQuery } from '@tanstack/react-query';
import { getEar, getReportByApplicationReport } from '../api/client';

const EAR_KEY = 'ear';
const EXPENSES_WITH_BILLS_KEY = 'expensesWithBills';

export const useEar = (groupId: number) => {
  return useQuery({
    queryKey: [EAR_KEY, groupId],
    queryFn: () => getEar(groupId),
    enabled: groupId > 0,
  });
};

export const useExpensesWithBills = (appId: number, groupId: number) => {
  return useQuery({
    queryKey: [EXPENSES_WITH_BILLS_KEY, appId, groupId],
    queryFn: () => getReportByApplicationReport(appId, groupId),
    enabled: appId > 0 && groupId > 0,
  });
};
