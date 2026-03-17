import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataGroups, createDataGroup } from '../api/client';

const DATA_GROUPS_KEY = 'data_groups';

export const useDataGroups = () => {
  return useQuery({
    queryKey: [DATA_GROUPS_KEY],
    queryFn: getDataGroups,
  });
};

export const useCreateDataGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, group_type }: { name: string; group_type: 'project' | 'organization' }) =>
      createDataGroup(name, group_type),
    onSuccess: () => {
      // Refetch data groups after successful creation
      queryClient.invalidateQueries({ queryKey: [DATA_GROUPS_KEY] });
    },
  });
};