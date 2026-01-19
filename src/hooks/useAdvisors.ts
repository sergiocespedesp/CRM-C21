import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvisorService } from '../services/advisorService';
import type { Advisor } from '../types';

export const advisorKeys = {
  all: ['advisors'] as const,
  lists: () => [...advisorKeys.all, 'list'] as const,
};

export function useAdvisors() {
  return useQuery({
    queryKey: advisorKeys.lists(),
    queryFn: () => AdvisorService.getAllAdvisors(),
  });
}

export function useCreateAdvisor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Advisor>) => AdvisorService.createAdvisor(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.all });
    },
  });
}

export function useUpdateAdvisor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Advisor> }) => 
      AdvisorService.updateAdvisor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.all });
    },
  });
}
