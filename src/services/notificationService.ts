import type { Lead } from '../types';
import type { Notification } from '../context/NotificationContext';

export class NotificationService {
    static checkOverdueActions(leads: Lead[]): Omit<Notification, 'id' | 'timestamp' | 'read'>[] {
        const notifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [];
        const now = new Date();

        leads.forEach(lead => {
            if (lead.nextActionDate) {
                const actionDate = new Date(lead.nextActionDate);
                const diffDays = Math.floor((now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    // Overdue
                    notifications.push({
                        type: diffDays > 5 ? 'error' : 'warning',
                        title: 'Acción Vencida',
                        message: `${lead.firstName} ${lead.lastName}: "${lead.nextAction}" vencida hace ${diffDays} día${diffDays > 1 ? 's' : ''}`,
                        leadId: lead.id,
                        actionId: lead.nextActionDate
                    });
                }
            }
        });

        return notifications;
    }

    static checkUpcomingActions(leads: Lead[]): Omit<Notification, 'id' | 'timestamp' | 'read'>[] {
        const notifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [];
        const now = new Date();

        leads.forEach(lead => {
            if (lead.nextActionDate) {
                const actionDate = new Date(lead.nextActionDate);
                const diffHours = Math.floor((actionDate.getTime() - now.getTime()) / (1000 * 60 * 60));

                if (diffHours > 0 && diffHours <= 48) {
                    // Upcoming in next 48 hours
                    const diffDays = Math.floor(diffHours / 24);
                    const timeText = diffDays > 0
                        ? `${diffDays} día${diffDays > 1 ? 's' : ''}`
                        : `${diffHours} hora${diffHours > 1 ? 's' : ''}`;

                    notifications.push({
                        type: diffHours <= 24 ? 'warning' : 'info',
                        title: 'Próxima Acción',
                        message: `${lead.firstName} ${lead.lastName}: "${lead.nextAction}" en ${timeText}`,
                        leadId: lead.id,
                        actionId: lead.nextActionDate
                    });
                }
            }
        });

        return notifications;
    }

    static generateDailyNotifications(leads: Lead[]): Omit<Notification, 'id' | 'timestamp' | 'read'>[] {
        const overdue = this.checkOverdueActions(leads);
        const upcoming = this.checkUpcomingActions(leads);
        return [...overdue, ...upcoming];
    }
}
