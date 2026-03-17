import { useQuery } from '@tanstack/react-query';
import { getSummaries } from '../api/client';

const SUMMARIES_KEY = 'summaries';

export const useSummaries = (groupId: number) => {
  return useQuery({
    queryKey: [SUMMARIES_KEY, groupId],
    queryFn: () => getSummaries(groupId),
    enabled: groupId > 0,
  });
};