// Utility functions for task management
import type { Lead } from '../types';

/**
 * Check if a date string represents an overdue task
 */
export const isOverdue = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Check if a date string is today
 */
export const isToday = (dateString: string | undefined): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get count of overdue tasks from leads
 */
export const getOverdueTaskCount = (leads: Lead[]): number => {
  return leads.filter(
    (lead) =>
      isOverdue(lead.nextActionDate) &&
      lead.stage !== 'CLOSED_WON' &&

      lead.stage !== 'DISCARDED'
  ).length;
};

/**
 * Get all leads with overdue tasks
 */
export const getOverdueLeads = (leads: Lead[]): Lead[] => {
  return leads.filter(
    (lead) =>
      isOverdue(lead.nextActionDate) &&
      lead.stage !== 'CLOSED_WON' &&

      lead.stage !== 'DISCARDED'
  );
};

/**
 * Format relative time (e.g., "2 days ago", "3 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `hace ${diffMins} min`;
  } else if (diffHours < 24) {
    return `hace ${diffHours}h`;
  } else {
    return `hace ${diffDays} días`;
  }
};
