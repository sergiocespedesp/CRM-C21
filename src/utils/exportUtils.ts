import * as XLSX from 'xlsx';
import type { Lead, Property, Advisor } from '../types';

/**
 * Format a lead object for export with human-readable values
 */
export const formatLeadForExport = (
    lead: Lead,
    properties: Property[],
    advisors: Advisor[]
): Record<string, any> => {
    const advisor = advisors.find(a => a.id === lead.advisorId);

    // Get property names from interests
    const propertyNames = lead.interests
        ?.map(interest => {
            const property = properties.find(p => p.id === interest.propertyId);
            return property?.name || 'Propiedad no encontrada';
        })
        .join(', ') || 'Sin intereses';

    return {
        'Nombre': `${lead.firstName} ${lead.lastName}`,
        'Email': lead.email,
        'Teléfono': lead.phone,
        'Ciudad': lead.city,
        'País': lead.country,
        'Temperatura': lead.temperature === 'HOT' ? 'Caliente' : lead.temperature === 'WARM' ? 'Tibio' : 'Frío',
        'Etapa': getStageLabel(lead.stage),
        'Fuente': lead.source,
        'Detalle Fuente': lead.sourceDetail || '',
        'Asesor': advisor?.name || 'Sin asignar',
        'Propiedades de Interés': propertyNames,
        'Próxima Acción': lead.nextAction || '',
        'Fecha Próxima Acción': lead.nextActionDate ? new Date(lead.nextActionDate).toLocaleString('es-BO') : '',
        'Fecha de Creación': new Date(lead.createdAt).toLocaleString('es-BO'),
        'Última Actualización': new Date(lead.updatedAt).toLocaleString('es-BO')
    };
};

/**
 * Get human-readable stage label
 */
const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
        'NEW': 'Nuevo',
        'INFO_SENT': 'Info Enviada',
        'CONTACTED': 'Contactado',
        'QUALIFIED': 'Calificado',
        'PRESENTATION': 'Presentación',
        'VISIT': 'Visita',
        'NEGOTIATION': 'Negociación',
        'CLOSED_WON': 'Cerrado Ganado',
        'DISCARDED': 'Descartado'
    };
    return labels[stage] || stage;
};

/**
 * Export leads to Excel format (.xlsx)
 */
export const exportToExcel = (
    leads: Lead[],
    properties: Property[],
    advisors: Advisor[]
): void => {
    // Format data for export
    const formattedData = leads.map(lead => formatLeadForExport(lead, properties, advisors));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths
    const columnWidths = [
        { wch: 25 }, // Nombre
        { wch: 30 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 15 }, // Ciudad
        { wch: 15 }, // País
        { wch: 12 }, // Temperatura
        { wch: 18 }, // Etapa
        { wch: 20 }, // Fuente
        { wch: 25 }, // Detalle Fuente
        { wch: 20 }, // Asesor
        { wch: 40 }, // Propiedades
        { wch: 30 }, // Próxima Acción
        { wch: 20 }, // Fecha Próxima Acción
        { wch: 20 }, // Fecha Creación
        { wch: 20 }  // Última Actualización
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `leads_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
};

/**
 * Export leads to CSV format
 */
export const exportToCSV = (
    leads: Lead[],
    properties: Property[],
    advisors: Advisor[]
): void => {
    // Format data for export
    const formattedData = leads.map(lead => formatLeadForExport(lead, properties, advisors));

    // Create worksheet (we'll use xlsx to generate CSV for consistency)
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `leads_${timestamp}.csv`;

    // Download as CSV
    XLSX.writeFile(workbook, filename, { bookType: 'csv' });
};

/**
 * Export a summary report with statistics
 */
export const exportSummaryReport = (
    leads: Lead[],
    properties: Property[],
    advisors: Advisor[]
): void => {
    // Calculate statistics
    const stats = {
        'Total de Leads': leads.length,
        'Leads Calientes': leads.filter(l => l.temperature === 'HOT').length,
        'Leads Tibios': leads.filter(l => l.temperature === 'WARM').length,
        'Leads Fríos': leads.filter(l => l.temperature === 'COLD').length,
        'Nuevos': leads.filter(l => l.stage === 'NEW').length,
        'Contactados': leads.filter(l => l.stage === 'CONTACTED').length,
        'Calificados': leads.filter(l => l.stage === 'QUALIFIED').length,
        'En Negociación': leads.filter(l => l.stage === 'NEGOTIATION').length,
        'Cerrados Ganados': leads.filter(l => l.stage === 'CLOSED_WON').length,
        'Descartados': leads.filter(l => l.stage === 'DISCARDED').length
    };

    // Format leads data
    const formattedLeads = leads.map(lead => formatLeadForExport(lead, properties, advisors));

    // Create summary worksheet
    const summaryData = Object.entries(stats).map(([key, value]) => ({
        'Métrica': key,
        'Valor': value
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];

    // Create leads worksheet
    const leadsSheet = XLSX.utils.json_to_sheet(formattedLeads);
    leadsSheet['!cols'] = [
        { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 20 },
        { wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads Detallados');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `reporte_leads_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
};
