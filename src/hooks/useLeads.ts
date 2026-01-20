import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeadService } from '../services/leadService';
import type { Lead, Interest } from '../types';
import type { LeadFormData } from '../components/LeadForm';

// Query Keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...leadKeys.lists(), { page, limit }] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

// Hook para obtener leads paginados
export function useLeadsPaginated(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: leadKeys.list(page, limit),
    queryFn: () => LeadService.getLeadsPaginated(page, limit),
  });
}

// Hook para obtener todos los leads (sin paginación)
export function useLeads() {
  return useQuery({
    queryKey: leadKeys.all,
    queryFn: () => LeadService.getAllLeads(),
  });
}

// Hook para obtener un lead específico
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => LeadService.getLeadById(id),
    enabled: !!id,
  });
}

// Hook para crear lead
export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => LeadService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

// Hook para actualizar lead
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => 
      LeadService.updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

// Hook para eliminar lead
export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => LeadService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

// Hook para agregar interés a la propiedad
export function useAddInterest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (interest: Interest) => LeadService.addInterest(interest),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

