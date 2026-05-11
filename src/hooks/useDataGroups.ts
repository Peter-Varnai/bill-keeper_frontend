import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDataGroups, createDataGroup, deleteDataGroup } from '../api/client';

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

export const useDeleteDataGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDataGroup(id),
    onSuccess: () => {
      // Invalidate to trigger refetch - the useEffect in App.tsx will handle selection
      queryClient.invalidateQueries({ queryKey: [DATA_GROUPS_KEY] });
    },
  });
};