import type { Lead, Advisor, Property, PipelineStage, LeadTemperature } from '../types';
import { LeadService } from './leadService';
import { AdvisorService } from './advisorService';
import { PropertyService } from './propertyService';

export interface ConversionMetrics {
    stage: PipelineStage;
    count: number;
    conversionRate: number;
    dropOffRate: number;
}

export interface AdvisorPerformance {
    advisor: Advisor;
    totalLeads: number;
    activeLeads: number;
    convertedLeads: number;
    conversionRate: number;
    averageResponseTime: number;
}

export interface LeadSourceData {
    source: string;
    count: number;
    percentage: number;
}

export interface TemperatureData {
    temperature: LeadTemperature;
    count: number;
    percentage: number;
}

export interface MonthlyTrend {
    month: string;
    newLeads: number;
    convertedLeads: number;
    revenue: number;
}

export interface AnalyticsSummary {
    totalLeads: number;
    activeLeads: number;
    convertedLeads: number;
    overallConversionRate: number;
    averageTimeToClose: number;
}

export class AnalyticsService {
    static async getSummary(): Promise<AnalyticsSummary> {
        const leads = await LeadService.getAllLeads();
        const totalLeads = leads.length;
        const activeLeads = leads.filter(l => l.stage !== 'CLOSED_WON' && l.stage !== 'DISCARDED').length;
        const convertedLeads = leads.filter(l => l.stage === 'CLOSED_WON').length;
        const overallConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        
        const closedWonLeads = leads.filter(l => l.stage === 'CLOSED_WON');
        let totalDays = 0;
        closedWonLeads.forEach(lead => {
            const created = new Date(lead.createdAt);
            const now = new Date();
            const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            totalDays += days;
        });
        const averageTimeToClose = closedWonLeads.length > 0 ? totalDays / closedWonLeads.length : 0;

        return { totalLeads, activeLeads, convertedLeads, overallConversionRate, averageTimeToClose };
    }

    static async getConversionMetrics(): Promise<ConversionMetrics[]> {
        const leads = await LeadService.getAllLeads();
        const stages: PipelineStage[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PRESENTATION', 'VISIT', 'CLOSED_WON', 'DISCARDED'];
        
        const metrics: ConversionMetrics[] = [];
        let previousCount = leads.length;

        stages.forEach((stage, index) => {
            const count = leads.filter(l => l.stage === stage).length;
            const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
            const dropOffRate = 100 - conversionRate;

            metrics.push({
                stage,
                count,
                conversionRate: index === 0 ? 100 : conversionRate,
                dropOffRate: index === 0 ? 0 : dropOffRate
            });

            previousCount = count;
        });

        return metrics;
    }

    static async getAdvisorPerformance(): Promise<AdvisorPerformance[]> {
        const leads = await LeadService.getAllLeads();
        const advisors = await AdvisorService.getAllAdvisors();

        const performance: AdvisorPerformance[] = advisors.map(advisor => {
            const advisorLeads = leads.filter(l => l.advisorId === advisor.id);
            const totalLeads = advisorLeads.length;
            const activeLeads = advisorLeads.filter(l => 
                l.stage !== 'CLOSED_WON' && l.stage !== 'DISCARDED'
            ).length;
            const convertedLeads = advisorLeads.filter(l => l.stage === 'CLOSED_WON').length;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

                        let totalResponseTime = 0;
            let leadsWithInteractions = 0;
            const averageResponseTime = 0;

            return { advisor, totalLeads, activeLeads, convertedLeads, conversionRate, averageResponseTime };
        });

        return performance.sort((a, b) => b.conversionRate - a.conversionRate);
    }

    static async getLeadSourceAnalysis(): Promise<LeadSourceData[]> {
        const leads = await LeadService.getAllLeads();
        const totalLeads = leads.length;

        const sourceCounts: { [key: string]: number } = {};
        leads.forEach(lead => {
            const source = lead.source || 'Unknown';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        const sourceData: LeadSourceData[] = Object.entries(sourceCounts).map(([source, count]) => ({
            source,
            count,
            percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
        }));

        return sourceData.sort((a, b) => b.count - a.count);
    }

    static async getTemperatureDistribution(): Promise<TemperatureData[]> {
        const leads = await LeadService.getAllLeads();
        const totalLeads = leads.length;

        const temperatures: LeadTemperature[] = ['HOT', 'WARM', 'COLD'];
        const tempData: TemperatureData[] = temperatures.map(temp => {
            const count = leads.filter(l => l.temperature === temp).length;
            return {
                temperature: temp,
                count,
                percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0
            };
        });

        return tempData;
    }

    static async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
        const leads = await LeadService.getAllLeads();
        const trends: MonthlyTrend[] = [];

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthLeads = leads.filter(l => {
                const createdDate = new Date(l.createdAt);
                return createdDate >= monthStart && createdDate <= monthEnd;
            });

            const convertedLeads = monthLeads.filter(l => l.stage === 'CLOSED_WON').length;
            const revenue = convertedLeads * 50000;

            trends.push({
                month: monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                newLeads: monthLeads.length,
                convertedLeads,
                revenue
            });
        }

        return trends;
    }

    static async getPropertyInterestAnalysis(): Promise<{ property: Property; interestCount: number }[]> {
        const leads = await LeadService.getAllLeads();
        const properties = await PropertyService.getAllProperties();

        const interestCounts: { [key: string]: number } = {};

        leads.forEach(lead => {
            if (lead.interests) {
                lead.interests.forEach(interest => {
                    interestCounts[interest.propertyId] = (interestCounts[interest.propertyId] || 0) + 1;
                });
            }
        });

        const analysis = properties.map(property => ({
            property,
            interestCount: interestCounts[property.id] || 0
        }));

        return analysis.sort((a, b) => b.interestCount - a.interestCount).slice(0, 10);
    }
}
