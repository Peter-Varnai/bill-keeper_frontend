import { useQuery } from '@tanstack/react-query';
import { getEar } from '../api/client';

const EAR_KEY = 'ear';

export const useEar = (groupId: number) => {
  return useQuery({
    queryKey: [EAR_KEY, groupId],
    queryFn: () => getEar(groupId),
    enabled: groupId > 0,
  });
};
