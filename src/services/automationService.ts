import type { Lead, Advisor } from '../types';
import { LeadService } from './leadService';
import { AdvisorService } from './advisorService';

export interface AutomationSettings {
    intelligentAssignment: boolean;
    autoEscalation: boolean;
    escalationDays: number;
    reminderGeneration: boolean;
    temperatureAdjustment: boolean;
    temperatureThresholds: {
        hot: number;
        warm: number;
    };
}

export interface AutomationLog {
    id: string;
    timestamp: string;
    action: 'ASSIGNMENT' | 'ESCALATION' | 'REMINDER' | 'TEMPERATURE';
    leadId: string;
    leadName: string;
    details: string;
    success: boolean;
}

const DEFAULT_SETTINGS: AutomationSettings = {
    intelligentAssignment: true,
    autoEscalation: true,
    escalationDays: 7,
    reminderGeneration: true,
    temperatureAdjustment: true,
    temperatureThresholds: {
        hot: 3,
        warm: 7
    }
};

export class AutomationService {
    private static SETTINGS_KEY = 'automation-settings';
    private static LOGS_KEY = 'automation-logs';
    private static MAX_LOGS = 100;

    static getSettings(): AutomationSettings {
        const stored = localStorage.getItem(this.SETTINGS_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }

    static saveSettings(settings: AutomationSettings): void {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    static getLogs(): AutomationLog[] {
        const stored = localStorage.getItem(this.LOGS_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private static addLog(log: Omit<AutomationLog, 'id' | 'timestamp'>): void {
        const logs = this.getLogs();
        const newLog: AutomationLog = {
            ...log,
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString()
        };
        logs.unshift(newLog);
        const trimmedLogs = logs.slice(0, this.MAX_LOGS);
        localStorage.setItem(this.LOGS_KEY, JSON.stringify(trimmedLogs));
    }

    static async assignLeadIntelligently(leadId: string): Promise<string> {
        const settings = this.getSettings();
        if (!settings.intelligentAssignment) {
            return '';
        }

        try {
            const advisors = await AdvisorService.getAllAdvisors();
            const activeAdvisors = advisors.filter(a => a.active);

            if (activeAdvisors.length === 0) {
                return '';
            }

            const leads = await LeadService.getAllLeads();

            const advisorWorkload = activeAdvisors.map(advisor => {
                const activeLeads = leads.filter(l =>
                    l.advisorId === advisor.id &&
                    l.stage !== 'CLOSED_WON' &&
                    l.stage !== 'DISCARDED'
                ).length;
                return { advisor, activeLeads };
            });

            advisorWorkload.sort((a, b) => a.activeLeads - b.activeLeads);
            const selectedAdvisor = advisorWorkload[0].advisor;

            const lead = leads.find(l => l.id === leadId);
            if (lead) {
                this.addLog({
                    action: 'ASSIGNMENT',
                    leadId,
                    leadName: `${lead.firstName} ${lead.lastName}`,
                    details: `Asignado a ${selectedAdvisor.name} (${advisorWorkload[0].activeLeads} leads activos)`,
                    success: true
                });
            }

            return selectedAdvisor.id;
        } catch (error) {
            console.error('Error in intelligent assignment:', error);
            return '';
        }
    }

    static async escalateInactiveLeads(): Promise<number> {
        const settings = this.getSettings();
        if (!settings.autoEscalation) {
            return 0;
        }

        try {
            const leads = await LeadService.getAllLeads();
            const now = new Date();
            let escalatedCount = 0;

            for (const lead of leads) {
                if (lead.stage === 'CLOSED_WON' || lead.stage === 'DISCARDED') {
                    continue;
                }

                const lastUpdate = new Date(lead.updatedAt);
                const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysSinceUpdate >= settings.escalationDays) {
                    this.addLog({
                        action: 'ESCALATION',
                        leadId: lead.id,
                        leadName: `${lead.firstName} ${lead.lastName}`,
                        details: `Escalado por ${daysSinceUpdate} días sin actividad`,
                        success: true
                    });

                    escalatedCount++;
                }
            }

            return escalatedCount;
        } catch (error) {
            console.error('Error escalating inactive leads:', error);
            return 0;
        }
    }

    static async generateReminders(): Promise<number> {
        const settings = this.getSettings();
        if (!settings.reminderGeneration) {
            return 0;
        }

        try {
            const leads = await LeadService.getAllLeads();
            const now = new Date();
            let remindersCreated = 0;

            for (const lead of leads) {
                if (!lead.nextActionDate) {
                    continue;
                }

                const actionDate = new Date(lead.nextActionDate);
                const hoursUntilAction = (actionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                if (hoursUntilAction > 0 && hoursUntilAction <= 24) {
                    this.addLog({
                        action: 'REMINDER',
                        leadId: lead.id,
                        leadName: `${lead.firstName} ${lead.lastName}`,
                        details: `Recordatorio para acción en ${Math.round(hoursUntilAction)}h`,
                        success: true
                    });

                    remindersCreated++;
                }
            }

            return remindersCreated;
        } catch (error) {
            console.error('Error generating reminders:', error);
            return 0;
        }
    }

    static async adjustLeadTemperatures(): Promise<number> {
        const settings = this.getSettings();
        if (!settings.temperatureAdjustment) {
            return 0;
        }

        try {
            const leads = await LeadService.getAllLeads();
            const now = new Date();
            let adjustedCount = 0;

            for (const lead of leads) {
                if (lead.stage === 'CLOSED_WON' || lead.stage === 'DISCARDED') {
                    continue;
                }

                const lastUpdate = new Date(lead.updatedAt);
                const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

                let newTemperature = lead.temperature;

                if (daysSinceUpdate <= settings.temperatureThresholds.hot) {
                    newTemperature = 'HOT';
                } else if (daysSinceUpdate <= settings.temperatureThresholds.warm) {
                    newTemperature = 'WARM';
                } else {
                    newTemperature = 'COLD';
                }

                if (newTemperature !== lead.temperature) {
                    await LeadService.updateLead(lead.id, { temperature: newTemperature });

                    this.addLog({
                        action: 'TEMPERATURE',
                        leadId: lead.id,
                        leadName: `${lead.firstName} ${lead.lastName}`,
                        details: `Temperatura ajustada de ${lead.temperature} a ${newTemperature}`,
                        success: true
                    });

                    adjustedCount++;
                }
            }

            return adjustedCount;
        } catch (error) {
            console.error('Error adjusting temperatures:', error);
            return 0;
        }
    }

    static async runAllAutomations(): Promise<{
        escalated: number;
        reminders: number;
        temperaturesAdjusted: number;
    }> {
        const [escalated, reminders, temperaturesAdjusted] = await Promise.all([
            this.escalateInactiveLeads(),
            this.generateReminders(),
            this.adjustLeadTemperatures()
        ]);

        return { escalated, reminders, temperaturesAdjusted };
    }

    static clearLogs(): void {
        localStorage.removeItem(this.LOGS_KEY);
    }

    static getAutomationStats(): {
        totalRuns: number;
        successRate: number;
        lastRun: string | null;
    } {
        const logs = this.getLogs();
        const totalRuns = logs.length;
        const successfulRuns = logs.filter(l => l.success).length;
        const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
        const lastRun = logs.length > 0 ? logs[0].timestamp : null;

        return { totalRuns, successRate, lastRun };
    }
}
