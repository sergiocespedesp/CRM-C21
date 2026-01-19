import type { Property, PropertyUnit } from '../types';
import { mockProperties, mockUnits } from './mockData';

// Helper to load from LocalStorage
const loadFromStorage = <T>(key: string, defaultData: T[]): T[] => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
};

// Helper to save to LocalStorage
const saveToStorage = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// In-memory storage
let properties: Property[] = loadFromStorage('crm_properties', mockProperties);
let units: PropertyUnit[] = loadFromStorage('crm_units', mockUnits);

export const PropertyService = {
    getAllProperties: async (): Promise<Property[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...properties];
    },

    getPropertyById: async (id: string): Promise<Property | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return properties.find(p => p.id === id);
    },

    createProperty: async (property: Omit<Property, 'id'>): Promise<Property> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newProperty = { ...property, id: `prop-${Date.now()}` };
        properties.push(newProperty);
        saveToStorage('crm_properties', properties);
        return newProperty;
    },

    updateProperty: async (id: string, updates: Partial<Property>): Promise<Property> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = properties.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Property not found');
        properties[index] = { ...properties[index], ...updates };
        saveToStorage('crm_properties', properties);
        return properties[index];
    },

    deleteProperty: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        properties = properties.filter(p => p.id !== id);
        saveToStorage('crm_properties', properties);

        // Cleanup associated units
        const relatedUnits = units.filter(u => u.propertyId === id);
        if (relatedUnits.length > 0) {
            units = units.filter(u => u.propertyId !== id);
            saveToStorage('crm_units', units);
        }
    },

    uploadImage: async (_propertyId: string, _file: File): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock upload: return a random architectural image from Unsplash
        return `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000&random=${Date.now()}`;
    },

    // Units Logic
    getUnitsByPropertyId: async (propertyId: string): Promise<PropertyUnit[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return units.filter(u => u.propertyId === propertyId);
    },

    getAllUnits: async (): Promise<PropertyUnit[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...units];
    },

    createUnit: async (unit: Omit<PropertyUnit, 'id'>): Promise<PropertyUnit> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newUnit = { ...unit, id: `unit-${Date.now()}` };
        units.push(newUnit);
        saveToStorage('crm_units', units);
        return newUnit;
    },

    updateUnit: async (id: string, updates: Partial<PropertyUnit>): Promise<PropertyUnit> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = units.findIndex(u => u.id === id);
        if (index === -1) throw new Error('Unit not found');
        units[index] = { ...units[index], ...updates };
        saveToStorage('crm_units', units);
        return units[index];
    },

    deleteUnit: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        units = units.filter(u => u.id !== id);
        saveToStorage('crm_units', units);
    }
};
