
import type { Advisor } from '../types';
import { mockAdvisors } from './mockData';

const STORAGE_KEY = 'crm_advisors';

const getStoredAdvisors = (): Advisor[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAdvisors));
        return mockAdvisors;
    }
    return JSON.parse(stored);
};

let advisors: Advisor[] = getStoredAdvisors();

export const AdvisorService = {
    getAllAdvisors: async (): Promise<Advisor[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        advisors = getStoredAdvisors(); // Refresh from storage
        return [...advisors];
    },

    getAdvisorById: async (id: string): Promise<Advisor | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        advisors = getStoredAdvisors();
        return advisors.find(a => a.id === id);
    },

    createAdvisor: async (advisor: Omit<Advisor, 'id'>): Promise<Advisor> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newAdvisor = { ...advisor, id: `adv-${Date.now()}` };
        advisors = [...advisors, newAdvisor];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(advisors));
        return newAdvisor;
    },

    updateAdvisor: async (id: string, updates: Partial<Advisor>): Promise<Advisor> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = advisors.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Advisor not found');

        const updatedAdvisor = { ...advisors[index], ...updates };
        advisors = advisors.map(a => a.id === id ? updatedAdvisor : a);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(advisors));
        return updatedAdvisor;
    }
};
