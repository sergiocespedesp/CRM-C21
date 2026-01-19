import { useMemo } from 'react';
import type { Lead, Interaction, Advisor } from '../types';
import { Users, Target, TrendingUp, DollarSign } from 'lucide-react';
import React from 'react';

export const useAnalytics = (leads: Lead[], interactions: any[], advisors: Advisor[]) => {
    const analytics = useMemo(() => {
        const totalLeads = leads.length;
        const hotLeads = leads.filter(l => l.temperature === 'HOT').length;
        const closedWon = leads.filter(l => l.stage === 'CLOSED_WON').length;
        const conversionRate = totalLeads > 0 ? (closedWon / totalLeads) * 100 : 0;

        // Calculate metrics
        const metrics = [
            {
                label: 'Total Leads',
                value: totalLeads,
                change: 12,
                trend: 'up' as const,
                icon: React.createElement(Users, { size: 24, className: 'text-blue-600' }),
                color: 'bg-blue-50'
            },
            {
                label: 'Leads Calientes',
                value: hotLeads,
                change: 8,
                trend: 'up' as const,
                icon: React.createElement(TrendingUp, { size: 24, className: 'text-red-600' }),
                color: 'bg-red-50'
            },
            {
                label: 'Tasa de Conversión',
                value: `${conversionRate.toFixed(1)}%`,
                change: 3.2,
                trend: 'up' as const,
                icon: React.createElement(Target, { size: 24, className: 'text-green-600' }),
                color: 'bg-green-50'
            },
            {
                label: 'Cerrados Ganados',
                value: closedWon,
                change: 15,
                trend: 'up' as const,
                icon: React.createElement(DollarSign, { size: 24, className: 'text-yellow-600' }),
                color: 'bg-yellow-50'
            }
        ];

        // Conversion funnel
        const stages = [
            { key: 'NEW', label: 'Nuevos' },
            { key: 'CONTACTED', label: 'Contactados' },
            { key: 'QUALIFIED', label: 'Calificados' },
            { key: 'PRESENTATION', label: 'Presentación' },
            { key: 'VISIT', label: 'Visita' },
            { key: 'NEGOTIATION', label: 'Negociación' },
            { key: 'CLOSED_WON', label: 'Cerrados' }
        ];

        const maxCount = Math.max(...stages.map(s => leads.filter(l => l.stage === s.key).length), 1);
        
        const conversionFunnel = stages.map(stage => {
            const count = leads.filter(l => l.stage === stage.key).length;
            return {
                stage: stage.label,
                count,
                percentage: (count / maxCount) * 100
            };
        });

        // Top advisors
        const advisorStats = advisors.map(advisor => {
            const advisorLeads = leads.filter(l => l.advisorId === advisor.id);
            const conversions = advisorLeads.filter(l => l.stage === 'CLOSED_WON').length;
            return {
                name: advisor.name,
                conversions,
                revenue: conversions * 50000 // Mock revenue
            };
        }).sort((a, b) => b.conversions - a.conversions).slice(0, 5);

        // Source breakdown
        const sources = [...new Set(leads.map(l => l.source))];
        const sourceBreakdown = sources.map(source => {
            const count = leads.filter(l => l.source === source).length;
            return {
                source,
                count,
                percentage: (count / totalLeads) * 100
            };
        }).sort((a, b) => b.count - a.count);

        return {
            metrics,
            conversionFunnel,
            topAdvisors: advisorStats,
            sourceBreakdown
        };
    }, [leads, interactions, advisors]);

    return analytics;
};