import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PropertyService } from '../services/propertyService';
import type { Property, PropertyUnit } from '../types';

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  units: () => [...propertyKeys.all, 'units'] as const,
};

export function useProperties() {
  return useQuery({
    queryKey: propertyKeys.lists(),
    queryFn: () => PropertyService.getAllProperties(),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => PropertyService.getPropertyById(id),
    enabled: !!id,
  });
}

export function useUnits() {
    return useQuery({
        queryKey: propertyKeys.units(),
        queryFn: () => PropertyService.getAllUnits(),
    });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Property>) => PropertyService.createProperty(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      PropertyService.updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => PropertyService.deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    },
  });
}

export function useCreateUnit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<PropertyUnit>) => PropertyService.createUnit(data as any),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: propertyKeys.units() })
    });
}

export function useUpdateUnit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PropertyUnit> }) => PropertyService.updateUnit(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: propertyKeys.units() })
    });
}
