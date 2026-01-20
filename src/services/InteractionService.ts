import api from './api';
import type { Interaction, VisitChecklist } from '../types';

export const InteractionService = {
    getAllInteractions: async (): Promise<Interaction[]> => {
        const response = await api.get('/interactions');
        return response.data;
    },

    getInteractionsByLeadId: async (leadId: string): Promise<Interaction[]> => {
        // Fetch specific lead to get interactions efficiently
        try {
            const response = await api.get(`/leads/${leadId}`);
            return response.data.interactions || [];
        } catch (e) {
            return [];
        }
    },

    getInteractionsByLeadIds: async (leadIds: string[]): Promise<Interaction[]> => {
        // Fallback to fetching all if no bulk endpoint
        const response = await api.get('/interactions');
        const all = response.data as Interaction[];
        const set = new Set(leadIds);
        return all.filter(i => set.has(i.leadId));
    },

    addInteraction: async (interaction: any): Promise<Interaction> => {
        const response = await api.post('/interactions', interaction);
        return response.data;
    },
    
    createVisitInteraction: async (leadId: string, advisorId: string, checklist: VisitChecklist): Promise<Interaction> => {
        const interactionData = {
            leadId,
            advisorId,
            type: 'VISIT',
            // origin: 'MANUAL',
            date: new Date(checklist.visitDate).toISOString(),
            content: `Visita realizada - Interés: ${checklist.clientInterest}`,
            notes: checklist.notes,
            // check if backend supports JSON field for checklist? Property features is JSON, Interaction not explicitly
        };
        const response = await api.post('/interactions', interactionData);
        return response.data;
    },
    
    updateInteraction: async (id: string, updates: any): Promise<Interaction> => {
        const response = await api.patch(`/interactions/${id}`, updates);
        return response.data;
    },

    deleteInteraction: async (id: string): Promise<void> => {
        await api.delete(`/interactions/${id}`);
    }
};

