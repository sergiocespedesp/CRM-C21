import { useMemo } from 'react';
import type { Lead, Interaction, Property, InteractionType } from '../../../types';

export interface DashboardData {
    newLeadsToday: number;
    tasksToday: number;
    overdueTasks: number;
    hotLeadsActive: number;
    activeProjects: number;
    priorityList: PriorityItem[];
    leadsBySourceToday: Record<string, number>;
    leadsByPropertyToday: Record<string, number>;
    dailyProgress: number; 
    funnelCounts: Record<string, number>;
    hotLeadsNoAction: Lead[];
    infoSentNoFollowup: Lead[];
    coolingDownLeads: Lead[];
    agendaItems: AgendaItem[];
    teamStats: any;
}

export interface PriorityItem {
    id: string; 
    name: string;
    property?: string;
    stage: string;
    nextAction: string;
    nextActionDate?: string;
    channel: string; 
    type: 'HOT' | 'OVERDUE' | 'TODAY' | 'NEW';
}

export interface AgendaItem {
    id: string;
    time: string;
    date: string; 
    title: string;
    type: InteractionType | 'TASK' | 'NEXT_ACTION';
    leadName?: string;
    leadId?: string;
    description?: string;
    color?: string;
    startTime: string;
    endTime: string;
}

export const useDashboardData = (
    leads: Lead[],
    interactions: Interaction[],
    properties: Property[] 
) => {
    return useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // --- Helpers ---
        const isToday = (dateStr: string) => {
            if (!dateStr) return false;
            return dateStr.startsWith(todayStr);
        };

        const isOverdue = (dateStr: string) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            d.setHours(0, 0, 0, 0);
            return d < today;
        };

        const getDaysDiff = (dateStr: string) => {
            if (!dateStr) return 999;
            const d = new Date(dateStr);
            const diff = new Date().getTime() - d.getTime();
            return Math.floor(diff / (1000 * 3600 * 24));
        };

        // --- Block 1: KPIs ---
        const newLeadsToday = leads.filter(l => isToday(l.createdAt)).length;
        const tasksToday = leads.filter(l => isToday(l.nextActionDate || '')).length;
        const overdueTasks = leads.filter(l => isOverdue(l.nextActionDate || '') && l.stage !== 'CLOSED_WON' && l.stage !== 'DISCARDED').length;
        const hotLeadsActive = leads.filter(l => l.temperature === 'HOT' && l.stage !== 'CLOSED_WON' && l.stage !== 'DISCARDED').length;
        const activeProjects = properties.filter(p => p.isProject && p.status === 'AVAILABLE').length;

        // --- Block 2: Priority List ---
        const priorityList: PriorityItem[] = [];

        // 1. Hot Leads
        leads.filter(l => l.temperature === 'HOT' && l.stage !== 'CLOSED_WON').forEach(l => {
            priorityList.push({
                id: l.id,
                name: `${l.firstName} ${l.lastName}`,
                property: properties.find(p => p.id === l.interests?.[0]?.propertyId)?.name || 'General',
                stage: l.stage,
                nextAction: l.nextAction || 'Contactar',
                nextActionDate: l.nextActionDate,
                channel: l.source,
                type: 'HOT'
            });
        });

        // 2. Overdue
        leads.filter(l => isOverdue(l.nextActionDate || '') && l.stage !== 'CLOSED_WON').forEach(l => {
            if (!priorityList.find(i => i.id === l.id)) {
                priorityList.push({
                    id: l.id,
                    name: `${l.firstName} ${l.lastName}`,
                    property: properties.find(p => p.id === l.interests?.[0]?.propertyId)?.name || 'General',
                    stage: l.stage,
                    nextAction: l.nextAction || 'Seguimiento',
                    nextActionDate: l.nextActionDate,
                    channel: l.source,
                    type: 'OVERDUE'
                });
            }
        });

        // 3. Today
        leads.filter(l => isToday(l.nextActionDate || '')).forEach(l => {
            if (!priorityList.find(i => i.id === l.id)) {
                priorityList.push({
                    id: l.id,
                    name: `${l.firstName} ${l.lastName}`,
                    property: properties.find(p => p.id === l.interests?.[0]?.propertyId)?.name || 'General',
                    stage: l.stage,
                    nextAction: l.nextAction || 'Tarea Hoy',
                    nextActionDate: l.nextActionDate,
                    channel: l.source,
                    type: 'TODAY'
                });
            }
        });

        // 4. New Unattended
        leads.filter(l => l.stage === 'NEW').forEach(l => {
            if (!priorityList.find(i => i.id === l.id)) {
                priorityList.push({
                    id: l.id,
                    name: `${l.firstName} ${l.lastName}`,
                    property: properties.find(p => p.id === l.interests?.[0]?.propertyId)?.name || 'General',
                    stage: l.stage,
                    nextAction: 'Contactar Inicialmente',
                    channel: l.source,
                    type: 'NEW'
                });
            }
        });

        // --- Block 3: Inputs ---
        const leadsBySourceToday: Record<string, number> = {};
        const leadsByPropertyToday: Record<string, number> = {};
        leads.filter(l => isToday(l.createdAt)).forEach(l => {
            leadsBySourceToday[l.source] = (leadsBySourceToday[l.source] || 0) + 1;
            const propId = l.interests?.[0]?.propertyId || 'unknown';
            leadsByPropertyToday[propId] = (leadsByPropertyToday[propId] || 0) + 1;
        });
        const totalNewToday = leads.filter(l => isToday(l.createdAt)).length;
        const attendedToday = leads.filter(l => isToday(l.createdAt) && l.stage !== 'NEW').length;
        const dailyProgress = totalNewToday > 0 ? (attendedToday / totalNewToday) * 100 : 0;

        // --- Block 4: Funnel ---
        const funnelCounts: Record<string, number> = {
            'RECIBIDOS': leads.filter(l => l.stage === 'NEW').length,
            'INFO_ENVIADA': leads.filter(l => l.stage === 'INFO_SENT').length,
            'CONTACTADOS': leads.filter(l => l.stage === 'CONTACTED').length,
            'EN_SEGUIMIENTO': leads.filter(l => ['QUALIFIED', 'PRESENTATION', 'NEGOTIATION'].includes(l.stage)).length,
            'VISITAS': leads.filter(l => l.stage === 'VISIT').length,
            'CERRADOS': leads.filter(l => l.stage === 'CLOSED_WON').length,
        };

        // --- Block 5: Risks ---
        const hotLeadsNoAction = leads.filter(l => l.temperature === 'HOT' && !l.nextActionDate);
        const infoSentNoFollowup = leads.filter(l => l.stage === 'INFO_SENT' && getDaysDiff(l.updatedAt) > 2);
        const coolingDownLeads = leads.filter(l => l.temperature !== 'COLD' && getDaysDiff(l.updatedAt) > 7);

        // --- Block 6: Agenda ---
        const agendaItems: AgendaItem[] = interactions
            .filter(i => i.type === 'NEXT_ACTION')
            .map(i => {
                const lead = leads.find(l => l.id === i.leadId);
                const actionDate = new Date(i.date);
                
                // USE DETAILS IF AVAILABLE
                const details = (i as any).details || {};
                const notes = (i as any).notes || i.content;

                // Fallback logic
                const timeMatch = notes.match(/(\d{1,2}):(\d{2})/);
                const startTime = details.startTime || (timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '09:00');
                
                let endTime = details.endTime;
                if (!endTime) {
                   const [h, m] = startTime.split(':').map(Number);
                   const endH = (h + 1) % 24;
                   endTime = `${endH.toString().padStart(2, '0')}:00`;
                }

                const title = details.title || notes.split('|')[0].trim();
                const color = details.color || (lead?.temperature === 'HOT' ? '#ef4444' : lead?.temperature === 'WARM' ? '#f59e0b' : '#9333ea');
                
                return {
                    id: i.id,
                    time: startTime, // Legacy field
                    title,
                    date: actionDate.toISOString().split('T')[0],
                    startTime,
                    endTime,
                    type: 'NEXT_ACTION' as const,
                    leadName: lead ? `${lead.firstName} ${lead.lastName}` : undefined,
                    leadId: i.leadId,
                    description: notes,
                    color
                };
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            newLeadsToday, tasksToday, overdueTasks, hotLeadsActive, activeProjects,
            priorityList, leadsBySourceToday, leadsByPropertyToday, dailyProgress,
            funnelCounts, hotLeadsNoAction, infoSentNoFollowup, coolingDownLeads,
            agendaItems, teamStats: {}
        };

    }, [leads, interactions, properties]);
};
