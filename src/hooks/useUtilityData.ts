import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUtilityData, saveUtilityData } from '../api/client';
import type { UtilityDataResponse } from '../api/client';

const UTILITY_DATA_KEY = 'utility_data';

export const useUtilityData = (dataGroupId: number) => {
  return useQuery<UtilityDataResponse, Error>({
    queryKey: [UTILITY_DATA_KEY, dataGroupId],
    queryFn: () => getUtilityData(dataGroupId),
    enabled: dataGroupId > 0,
  });
};

export const useSaveUtilityData = (dataGroupId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bankStand,
      cashStand,
    }: {
      bankStand: number | null;
      cashStand: number | null;
    }) => saveUtilityData(dataGroupId, bankStand, cashStand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [UTILITY_DATA_KEY, dataGroupId] });
    },
  });
};