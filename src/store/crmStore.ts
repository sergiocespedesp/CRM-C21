// src/store/crmStore.ts
import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';
import type { Lead, Interaction, Advisor, Property } from '../types';
import { LeadService } from '../services/leadService';
import { mockAdvisors, mockProperties } from '../services/mockData';

export type CrmState = {
  leads: Lead[];
  interactions: Interaction[];
  advisors: Advisor[];
  properties: Property[];
  isLoading: boolean;
  // actions
  loadInitialData: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>;
  addInteraction: (leadId: string, interaction: Omit<Interaction, 'id' | 'leadId' | 'date'>) => Promise<Interaction>;
};

type CrmStateCreator = StateCreator<CrmState, [], [["zustand/persist", unknown]]>;

const createCrmStore: CrmStateCreator = (set: any) => ({
  leads: [],
  interactions: [],
  advisors: [],
  properties: [],
  isLoading: false,
  loadInitialData: async () => {
    set({ isLoading: true });
    try {
        const [leads, interactions] = await Promise.all([
            LeadService.getAllLeads(),
            LeadService.getAllInteractions(),
        ]);
        set({ leads, interactions, advisors: mockAdvisors, properties: mockProperties });
    } catch (error) {
        console.error('Error loading initial data:', error);
    } finally {
        set({ isLoading: false });
    }
  },
  addLead: async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    // @ts-ignore
    const newLead = await LeadService.addLead(lead); 
    const allLeads = await LeadService.getAllLeads();
    set({ leads: allLeads });
    return newLead;
  },
  addInteraction: async (leadId: string, interaction: Omit<Interaction, 'id' | 'leadId' | 'date'>) => {
    const newInteraction = await LeadService.addInteraction(leadId, interaction);
    const allInteractions = await LeadService.getAllInteractions();
    set((state: CrmState) => ({ 
        interactions: allInteractions,
        leads: state.leads.map((l: Lead) => l.id === leadId ? { ...l, updatedAt: new Date().toISOString() } : l)
    }));
    return newInteraction;
  },
});

export const useCrmStore = create<CrmState>()(
  persist(
    createCrmStore,
    {
      name: 'crm-store',
      partialize: (state: CrmState) => ({ 
          leads: state.leads,
          interactions: state.interactions
      }), 
    }
  )
);
