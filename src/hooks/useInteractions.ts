import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InteractionService } from '../services/InteractionService';
import { leadKeys } from './useLeads';
import type { Interaction, VisitChecklist } from '../types';

export const interactionKeys = {
  all: ['interactions'] as const,
  lists: () => [...interactionKeys.all, 'list'] as const,
};

export function useInteractions() {
  return useQuery({
    queryKey: interactionKeys.all,
    queryFn: () => InteractionService.getAllInteractions(),
  });
}

export function useAddInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Interaction>) => InteractionService.addInteraction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.all }); 
      // If we have leadId, we could be more specific, but invalidating all leads is safe
      if (variables.leadId) {
          queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) });
      }
    },
  });
}

export function useUpdateInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Interaction> }) => 
      InteractionService.updateInteraction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
       if (variables.data.leadId) {
          queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.data.leadId) });
      }
    },
  });
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => InteractionService.deleteInteraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useCreateVisitInteraction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leadId, advisorId, checklist }: { leadId: string; advisorId: string; checklist: VisitChecklist }) => 
      InteractionService.createVisitInteraction(leadId, advisorId, checklist),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) });
    },
  });
}

