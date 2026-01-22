import api from './api';
import type { Property, PropertyUnit } from '../types';

export const PropertyService = {
    getAllProperties: async (): Promise<Property[]> => {
        const response = await api.get<Property[]>('/properties');
        // Ensure proper typing for numeric fields that might come as strings from DB
        return response.data.map(transformPropertyDates);
    },

    getPropertyById: async (id: string): Promise<Property | undefined> => {
        const response = await api.get<Property>(`/properties/${id}`);
        return transformPropertyDates(response.data);
    },

    createProperty: async (property: Omit<Property, 'id'>): Promise<Property> => {
        const response = await api.post<Property>('/properties', property);
        return transformPropertyDates(response.data);
    },

    updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
        const response = await api.patch<Property>(`/properties/${id}`, updates);
        return transformPropertyDates(response.data);
    },

    deleteProperty: async (id: string): Promise<void> => {
        await api.delete(`/properties/${id}`);
    },

    // Units Logic
    getAllUnits: async (): Promise<PropertyUnit[]> => {
        const response = await api.get<PropertyUnit[]>('/units');
        return response.data.map(transformUnitNumerics);
    },

    createUnit: async (unit: Omit<PropertyUnit, 'id'>): Promise<PropertyUnit> => {
        const response = await api.post<PropertyUnit>('/units', unit);
        return transformUnitNumerics(response.data);
    },

    updateUnit: async (id: string, updates: Partial<PropertyUnit>): Promise<PropertyUnit> => {
        const response = await api.patch<PropertyUnit>(`/units/${id}`, updates);
        return transformUnitNumerics(response.data);
    },

    deleteUnit: async (id: string): Promise<void> => {
        await api.delete(`/units/${id}`);
    }
};

// Helpers to ensure data consistency from API/DB
const transformPropertyDates = (p: Property): Property => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    // Ensure numeric fields are numbers
    price: Number(p.price),
    landArea: p.landArea ? Number(p.landArea) : undefined,
    builtArea: p.builtArea ? Number(p.builtArea) : undefined,
    bathrooms: p.bathrooms ? Number(p.bathrooms) : undefined,
    garages: p.garages ? Number(p.garages) : undefined,
    pricePerSqmFrom: p.pricePerSqmFrom ? Number(p.pricePerSqmFrom) : undefined,
    pricePerSqmTo: p.pricePerSqmTo ? Number(p.pricePerSqmTo) : undefined,
    exchangeRate: p.exchangeRate ? Number(p.exchangeRate) : undefined,
});

const transformUnitNumerics = (u: PropertyUnit): PropertyUnit => ({
    ...u,
    floor: u.floor ? Number(u.floor) : undefined,
    area: Number(u.area),
    bathrooms: u.bathrooms ? Number(u.bathrooms) : undefined,
    price: Number(u.price),
});
