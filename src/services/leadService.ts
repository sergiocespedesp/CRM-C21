import api from './api';
import type { Lead, Interaction } from '../types';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export const LeadService = {
  getAllLeads: async (): Promise<Lead[]> => {
    try {
      const response = await api.get('/leads');
      // Compatibilidad: extraer array si viene en formato paginado
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  },

  getAllInteractions: async (): Promise<Interaction[]> => {
     try {
       const response = await api.get('/interactions');
       return response.data;
     } catch (error) {
        console.error('Error fetching interactions:', error);
        return [];
     }
  },

  createLead: async (data: any): Promise<Lead> => {
      const response = await api.post('/leads', data);
      return response.data;
  },
  
  addLead: async (data: any): Promise<Lead> => {
      return LeadService.createLead(data);
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
      const response = await api.patch(`/leads/${id}`, data);
      return response.data;
  },

  deleteLead: async (id: string): Promise<void> => {
      await api.delete(`/leads/${id}`);
  },

  addInteraction: async (leadId: string | any, interaction?: any): Promise<Interaction> => {
       let payload;
       if (typeof leadId === 'string' && interaction) {
           payload = { ...interaction, leadId };
       } else {
           payload = leadId;
       }
       
       // Handle case where payload might be missing leadId if passed as object
       if (!payload.leadId && typeof leadId === 'string') {
            payload.leadId = leadId;
       }

       const response = await api.post('/interactions', payload);
       return response.data;
  },

  addInterest: async (interest: any): Promise<any> => {
      console.warn('Backend does not support structured Interest resource yet. Operation simulated.', interest);
      return interest;
  },

  ingestLead: async (data: any): Promise<{ lead: Lead; isNew: boolean }> => {
      try {
          // Simple implementation: Always try create. 
          // Real implementation would check duplicate email/phone.
          const lead = await LeadService.createLead(data);
          return { lead, isNew: true };
      } catch (error) {
          console.error("Ingest lead failed", error);
          throw error;
      }
  },
  getLeadsPaginated: async (page: number = 1, limit: number = 50): Promise<PaginatedResponse<Lead>> => {
    try {
      const response = await api.get(`/leads?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated leads:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      };
    }
  },
  
  getLeadsByAdvisor: async (advisorId: string): Promise<Lead[]> => {
      // Fetch all and filter client-side until backend supports query params
      const leads = await LeadService.getAllLeads();
      return leads.filter(lead => lead.advisorId === advisorId);
  },

  
  getLeadById: async (id: string): Promise<Lead> => {
      const response = await api.get(`/leads/${id}`);
      return response.data;
  },

  getInteractionsByLeadId: async (leadId: string): Promise<Interaction[]> => {
      // Fetch all and filter client-side until backend supports query params
      const interactions = await LeadService.getAllInteractions();
      return interactions.filter(i => i.leadId === leadId);
  },



  addInterest: async (interest: Interest): Promise<Interest> => {
    const response = await api.post(/leads//interests, {
      propertyId: interest.propertyId,
      notes: interest.notes
    });
    return response.data;
  },

  // Deprecated sync methods stubs
  getLeads: () => [],
  getInteractions: () => [],
};
