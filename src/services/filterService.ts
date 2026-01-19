import type { PipelineStage, LeadTemperature } from '../types';

export interface FilterState {
    searchTerm: string;
    stage: PipelineStage | 'ALL';
    temperature: LeadTemperature | 'ALL';
    dateFrom?: string;
    dateTo?: string;
    source?: string;
    advisorId?: string;
}

export interface FilterPreset {
    name: string;
    filters: FilterState;
    createdAt: string;
}

const STORAGE_KEY = 'crm_filter_presets';

/**
 * Save a filter preset to localStorage
 */
export const saveFilterPreset = (name: string, filters: FilterState): boolean => {
    try {
        const presets = loadFilterPresets();

        // Check if preset with same name exists
        const existingIndex = presets.findIndex(p => p.name === name);

        const newPreset: FilterPreset = {
            name,
            filters,
            createdAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            // Update existing preset
            presets[existingIndex] = newPreset;
        } else {
            // Add new preset
            presets.push(newPreset);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
        return true;
    } catch (error) {
        console.error('Error saving filter preset:', error);
        return false;
    }
};

/**
 * Load all filter presets from localStorage
 */
export const loadFilterPresets = (): FilterPreset[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        return JSON.parse(stored) as FilterPreset[];
    } catch (error) {
        console.error('Error loading filter presets:', error);
        return [];
    }
};

/**
 * Delete a filter preset
 */
export const deleteFilterPreset = (name: string): boolean => {
    try {
        const presets = loadFilterPresets();
        const filtered = presets.filter(p => p.name !== name);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting filter preset:', error);
        return false;
    }
};

/**
 * Load and return a specific filter preset
 */
export const applyFilterPreset = (name: string): FilterState | null => {
    try {
        const presets = loadFilterPresets();
        const preset = presets.find(p => p.name === name);

        return preset ? preset.filters : null;
    } catch (error) {
        console.error('Error applying filter preset:', error);
        return null;
    }
};

/**
 * Get default/empty filter state
 */
export const getDefaultFilterState = (): FilterState => {
    return {
        searchTerm: '',
        stage: 'ALL',
        temperature: 'ALL',
        dateFrom: undefined,
        dateTo: undefined,
        source: undefined,
        advisorId: undefined
    };
};
