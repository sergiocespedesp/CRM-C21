import { useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { useLeads } from './useLeads';
import { useInteractions } from './useInteractions';
import type { Lead, Interaction, AgendaItem } from '../types';

interface DashboardStats {
    totalLeads: number;
    hotLeads: number;
    warmLeads: number;
    overdueLeads: number;
}



interface ActivityItem {
    id: string;
    leadId: string;
    leadName: string;
    type: string;
    content: string;
    date: string;
}

export const useDashboardData = () => {
    const { user } = useAuth();
    
    // Use React Query hooks
    const { data: allLeads = [], isLoading: isLoadingLeads } = useLeads();
    const { data: allInteractions = [], isLoading: isLoadingInteractions } = useInteractions();

    // Filter leads based on user role
    const leads = useMemo(() => {
        if (user?.role === 'ADVISOR' && user.advisorId) {
            return allLeads.filter(l => l.advisorId === user.advisorId);
        }
        return allLeads;
    }, [allLeads, user]);

    // Calculate Stats
    const stats = useMemo<DashboardStats>(() => {
        const now = new Date();
        const fiveDaysAgo = new Date(now);
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        return {
            totalLeads: leads.length,
            hotLeads: leads.filter(l => l.temperature === 'HOT').length,
            warmLeads: leads.filter(l => l.temperature === 'WARM').length,
            overdueLeads: leads.filter(l => 
                new Date(l.updatedAt) < fiveDaysAgo && 
                l.stage !== 'CLOSED_WON' && 
                l.stage !== 'DISCARDED'
            ).length
        };
    }, [leads]);

    // High Priority Leads
    const highPriorityLeads = useMemo(() => {
        return [...leads]
            .filter(l => l.temperature === 'HOT' || l.stage === 'NEGOTIATION')
            .sort((a, b) => {
                if (a.temperature === 'HOT' && b.temperature !== 'HOT') return -1;
                if (a.temperature !== 'HOT' && b.temperature === 'HOT') return 1;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            })
            .slice(0, 5);
    }, [leads]);

    // Upcoming Actions (List View)
    const upcomingActions = useMemo<AgendaItem[]>(() => {
        return leads
            .filter(l => l.nextAction && l.nextActionDate)
            .map(l => ({
                id: `action-${l.id}`,
                leadId: l.id,
                leadName: `${l.firstName} ${l.lastName}`,
                description: l.nextAction!,
                title: l.nextAction!,
                type: 'NEXT_ACTION' as const,
                date: l.nextActionDate!,
                startTime: '',
                endTime: ''
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 10);
    }, [leads]);

    // Agenda Events (Calendar View)
    const agendaEvents = useMemo<AgendaItem[]>(() => {
        const events: AgendaItem[] = [];

        // 1. Add NEXT_ACTION from leads
        leads.forEach(lead => {
            if (lead.nextActionDate && lead.nextAction) {
                const dateObj = new Date(lead.nextActionDate);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                const endTimeObj = new Date(dateObj.getTime() + 30*60000); // +30 mins
                const endTimeStr = endTimeObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

                events.push({
                    id: `lead-${lead.id}`,
                    title: `${lead.nextAction}: ${lead.firstName} ${lead.lastName}`,
                    date: dateStr,
                    startTime: timeStr,
                    endTime: endTimeStr,
                    type: 'NEXT_ACTION' as const,
                    leadId: lead.id,
                    leadName: `${lead.firstName} ${lead.lastName}`,
                    description: `Acción programada: ${lead.nextAction}`,
                    color: '#BEAF87'
                });
            }
        });

        // 2. Add Interactions
        // Filter interactions if needed
        let relevantInteractions = allInteractions;
        if (user?.role === 'ADVISOR' && user.advisorId) {
            const userLeadIds = new Set(leads.map(l => l.id));
            relevantInteractions = allInteractions.filter(i => userLeadIds.has(i.leadId));
        }

        relevantInteractions.forEach(int => {
            const lead = leads.find(l => l.id === int.leadId);
            const leadName = lead ? `${lead.firstName} ${lead.lastName}` : '';
            const dateObj = new Date(int.date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
            const endTimeObj = new Date(dateObj.getTime() + 30*60000);
            const endTimeStr = endTimeObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

            let title = int.content || 'Evento sin título';
            if (leadName) {
                const typeLabel = {'CALL':'Llamada','NOTE':'Nota','EMAIL':'Email','MEETING':'Reunión','NEXT_ACTION':'Próx. Acción','VISIT':'Visita', 'WHATSAPP': 'WhatsApp', 'MESSENGER': 'Messenger'}[int.type] || int.type;
                title = `${typeLabel}: ${leadName}`;
            }

            events.push({
                id: `int-${int.id}`,
                title: title,
                date: dateStr,
                startTime: timeStr,
                endTime: endTimeStr,
                type: int.type,
                leadId: int.leadId,
                leadName: leadName,
                description: int.notes,
                color: leadName ? '#1A1A1A' : '#9333ea'
            });
        });

        return events;
    }, [leads, allInteractions, user]);

    // Recent Activity
    const recentActivity = useMemo<ActivityItem[]>(() => {
        let relevantInteractions = allInteractions;
        if (user?.role === 'ADVISOR' && user.advisorId) {
            const userLeadIds = new Set(leads.map(l => l.id));
            relevantInteractions = allInteractions.filter(i => userLeadIds.has(i.leadId));
        }

        return relevantInteractions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map(interaction => {
                const lead = leads.find(l => l.id === interaction.leadId);
                return {
                    id: interaction.id,
                    leadId: interaction.leadId,
                    leadName: lead ? `${lead.firstName} ${lead.lastName}` : 'Lead desconocido',
                    type: interaction.type,
                    content: interaction.content,
                    date: interaction.date
                };
            });
    }, [allInteractions, leads, user]);

    return {
        stats,
        highPriorityLeads,
        recentActivity,
        upcomingActions,
        agendaEvents,
        leads, 
        loading: isLoadingLeads || isLoadingInteractions
    };
};
