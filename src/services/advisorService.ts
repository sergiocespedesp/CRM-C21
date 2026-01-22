import api from './api';
import type { Advisor } from '../types';

export const AdvisorService = {
    getAllAdvisors: async (): Promise<Advisor[]> => {
        try {
            const response = await api.get('/users');
            // Mapping backend User to frontend Advisor interface
            const users = Array.isArray(response.data) ? response.data : [];
            return users
                //.filter((u: any) => u.role === 'ADVISOR') // Optional: Filter by role
                .map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone || '', // Handle missing fields gracefully
                    active: u.active !== false,
                    role: u.role,
                    photo: u.photo || undefined,
                    office: u.office || undefined
                }));
        } catch (error) {
            console.error('Error fetching advisors:', error);
            return [];
        }
    },

    getAdvisorById: async (id: string): Promise<Advisor | undefined> => {
        try {
            const response = await api.get(/users/);
            const u = response.data;
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone || '',
                active: u.active !== false,
                role: u.role,
                photo: u.photo,
                office: u.office
            };
        } catch (error) {
            console.error('Error fetching advisor:', error);
            return undefined;
        }
    },

    createAdvisor: async (advisor: Omit<Advisor, 'id'>): Promise<Advisor> => {
        // Default password for new advisors created via admin panel
        const payload = {
            ...advisor,
            password: 'Password123!', 
        };
        const response = await api.post('/users', payload);
        const u = response.data;
        return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || advisor.phone,
            active: u.active,
            role: u.role,
            photo: u.photo,
            office: u.office
        };
    },

    updateAdvisor: async (id: string, updates: Partial<Advisor>): Promise<Advisor> => {
        const response = await api.patch(/users/, updates);
        const u = response.data;
        return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            active: u.active,
            role: u.role,
            photo: u.photo,
            office: u.office
        };
    },
    
    deleteAdvisor: async (id: string): Promise<void> => {
        await api.delete(/users/);
    }
};
