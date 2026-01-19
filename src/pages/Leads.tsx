import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Search, Plus, Filter, Download, FileSpreadsheet, FileText, 
    MoreHorizontal, Phone, Mail, MapPin, Calendar, User, 
    Building2, Trash2, Printer, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { LeadService, type PaginatedResponse } from '../services/leadService';
import { AdvisorService } from '../services/advisorService';
import { PropertyService } from '../services/propertyService';
import type { Lead, Advisor, Property, PipelineStage } from '../types';

import LeadForm, { type LeadFormData } from '../components/LeadForm';

const getStageLabel = (stage: string) => {
    const map: Record<string, string> = {
        'NEW': 'NUEVO', 'INFO_SENT': 'INFO ENVIADA', 'CONTACTED': 'CONTACTADO',
        'QUALIFIED': 'CALIFICADO', 'PRESENTATION': 'PRESENTACIÓN', 'VISIT': 'VISITA',
        'NEGOTIATION': 'NEGOCIACIÓN', 'CLOSED_WON': 'GANADO', 'DISCARDED': 'DESCARTADO'
    };
    return map[stage] || stage;
};

const getTempLabel = (temp: string) => {
    const map: Record<string, string> = { 'HOT': 'CALIENTE', 'WARM': 'TIBIO', 'COLD': 'FRÍO' };
    return map[temp] || temp;
};

const Leads = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Init state from URL or defaults
    const [leads, setLeads] = useState<Lead[]>([]);
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination from URL
    const initialPage = Number(searchParams.get('page')) || 1;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(5); // Mocked for now if backend pagination is simple
    const [totalLeads, setTotalLeads] = useState(0);
    const ITEMS_PER_PAGE = 50;

    // Filters from URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedAdvisor, setSelectedAdvisor] = useState(searchParams.get('advisor') || 'all');
    const [selectedStage, setSelectedStage] = useState(searchParams.get('stage') || 'all');
    const [selectedProperty, setSelectedProperty] = useState(searchParams.get('property') || 'all');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [showNewLeadModal, setShowNewLeadModal] = useState(false);

    // Sync URL when filters change
    useEffect(() => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedAdvisor !== 'all') params.advisor = selectedAdvisor;
        if (selectedStage !== 'all') params.stage = selectedStage;
        if (selectedProperty !== 'all') params.property = selectedProperty;
        if (currentPage > 1) params.page = currentPage.toString();
        
        setSearchParams(params, { replace: true });
    }, [searchTerm, selectedAdvisor, selectedStage, selectedProperty, currentPage, setSearchParams]);

    const STAGES: PipelineStage[] = ['NEW', 'INFO_SENT', 'CONTACTED', 'QUALIFIED', 'PRESENTATION', 'VISIT', 'NEGOTIATION', 'CLOSED_WON', 'DISCARDED'];

    // Load Data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [leadsResponse, advisorsData, propertiesData] = await Promise.all([
                LeadService.getLeadsPaginated(currentPage, ITEMS_PER_PAGE),
                AdvisorService.getAllAdvisors(),
                PropertyService.getAllProperties()
            ]);
            // Backend might return different structure, adapting safely
            setLeads(leadsResponse.data || []);
            setTotalPages(leadsResponse.pagination?.totalPages || 1);
            setTotalLeads(leadsResponse.pagination?.total || 0);
            setAdvisors(advisorsData || []);
            setProperties(propertiesData || []);
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to empty to avoid crashing
            setLeads([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    // Initial Load
    useEffect(() => {
        loadData();
    }, [loadData]);


    // Filter Logic (Memoized)
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = 
                lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm);
            
            const matchesAdvisor = selectedAdvisor === 'all' || lead.advisorId === selectedAdvisor;
            const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;
            const matchesProperty = selectedProperty === 'all' || 
            (lead.interests && lead.interests.some(i => i.propertyId === selectedProperty)) ||
            (lead.interest && lead.interest === properties.find(p => p.id === selectedProperty)?.name);

            return matchesSearch && matchesAdvisor && matchesStage && matchesProperty;
        });
    }, [leads, searchTerm, selectedAdvisor, selectedStage, selectedProperty, properties]);

    // Formatting Helpers
    const getAdvisorName = (id: string) => {
        const advisor = advisors.find(a => a.id === id);
        return advisor ? advisor.name : 'Sin asignar';
    };

    const getPropertyName = (lead: Lead) => {
        if (lead.interests && lead.interests.length > 0) {
            const lastInterest = lead.interests[leads.length - 1] || lead.interests[0];
            const prop = properties.find(p => p.id === lastInterest.propertyId);
            return prop ? prop.name : 'Propiedad no encontrada';
        }
        return 'Sin interés registrado';
    };
    
    const getDaysUnattended = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 3600 * 24));
    };

    // Export Handler
    const handleExportExcel = () => {
        const dataToExport = filteredLeads.map(lead => ({
            Nombre: `${lead.firstName} ${lead.lastName}`,
            Email: lead.email,
            Teléfono: lead.phone,
            Etapa: lead.stage,
            Temperatura: lead.temperature,
            Asesor: getAdvisorName(lead.advisorId),
            Inmueble: getPropertyName(lead),
            'Próxima Acción': lead.nextAction || '',
            'Fecha Acción': lead.nextActionDate ? new Date(lead.nextActionDate).toLocaleDateString() : '',
            'Notas': lead.internalNotes || ''
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(wb, "leads_c21.xlsx");
    };

    const handleExportCSV = () => {
        const dataToExport = filteredLeads.map(lead => ({
            Nombre: `${lead.firstName} ${lead.lastName}`,
            Email: lead.email,
            Teléfono: lead.phone,
            Etapa: lead.stage,
            Temperatura: lead.temperature,
            Asesor: getAdvisorName(lead.advisorId),
            Inmueble: getPropertyName(lead),
            'Próxima Acción': lead.nextAction || '',
            'Fecha Acción': lead.nextActionDate ? new Date(lead.nextActionDate).toLocaleDateString() : '',
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'leads_c21.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePrintReport = () => {
        window.print();
    };

    const handleDeleteLead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de eliminar este lead?')) {
            await LeadService.deleteLead(id);
            await loadData();
        }
    };

    const handleSaveLead = async (leadData: LeadFormData) => {
        try {
            await LeadService.createLead({
                firstName: leadData.firstName,
                lastName: leadData.lastName,
                email: leadData.email,
                phone: leadData.phone,
                source: leadData.source,
                city: 'La Paz',
                country: 'Bolivia',
                stage: 'NEW',
                temperature: 'WARM',
                advisorId: '', 
                budget: leadData.budget as any,
                preferredZone: leadData.preferredZone,
                timing: leadData.timing as any
            });
            
            setShowNewLeadModal(false);
            await loadData(); 
        } catch (error) {
            console.error('Error creating lead:', error);
        }
    };

    return (
        <div className="p-4 w-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold font-display text-gray-900">Leads</h1>
                    <p className="text-gray-500 mt-1">Gestión de prospectos y clientes potenciales</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <FileSpreadsheet size={18} className="text-green-600" />
                        <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <FileText size={18} className="text-blue-600" />
                        <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button onClick={handlePrintReport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <Printer size={18} className="text-purple-600" />
                        <span className="hidden sm:inline">Reporte</span>
                    </button>
                    <button onClick={() => setShowNewLeadModal(true)} className="btn btn-primary gap-2">
                        <Plus size={16} />
                        Nuevo Lead
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedAdvisor}
                            onChange={(e) => setSelectedAdvisor(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                        >
                            <option value="all">Todos los asesores</option>
                            {advisors.map(adv => (
                                <option key={adv.id} value={adv.id}>{adv.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-sm"
                        >
                            <option value="all">Todas las etapas</option>
                            {STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="px-4 py-4">Inmueble</th>
                                    <th className="px-4 py-4">Fecha Creación</th>
                                    <th className="px-4 py-4">Nombre</th>
                                    <th className="px-4 py-4">Teléfono</th>
                                    <th className="px-4 py-4">Ciudad</th>
                                    <th className="px-4 py-4">Asesor</th>
                                    <th className="px-4 py-4">Estado</th>
                                    <th className="px-4 py-4">Temp.</th>
                                    <th className="px-4 py-4">Origen</th>
                                    <th className="px-4 py-4">Días Sin Atender</th>
                                    <th className="px-4 py-4">Email</th>
                                    <th className="px-4 py-4 text-right print:hidden">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLeads.map((lead) => (
                                    <tr 
                                        key={lead.id} 
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                        className="group hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                                    >
                                        <td className="px-4 py-4 text-gray-600 truncate max-w-[200px]" title={lead.interest}>
                                            {lead.interest || '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-gray-900">
                                            {lead.firstName} {lead.lastName}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {lead.phone}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {lead.city || '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {getAdvisorName(lead.advisorId)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                ${lead.stage === 'NEW' ? 'bg-blue-50 text-blue-700' : 
                                                  lead.stage === 'CONTACTED' ? 'bg-yellow-50 text-yellow-700' :
                                                  lead.stage === 'QUALIFIED' ? 'bg-purple-50 text-purple-700' :
                                                  lead.stage === 'CLOSED_WON' ? 'bg-green-50 text-green-700' :
                                                  'bg-gray-50 text-gray-700'}`}>
                                                {getStageLabel(lead.stage)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    lead.temperature === 'HOT' ? 'bg-red-500' :
                                                    lead.temperature === 'WARM' ? 'bg-yellow-500' :
                                                    'bg-blue-400'
                                                }`} />
                                                {getTempLabel(lead.temperature)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500">
                                            {lead.source || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-bold ${getDaysUnattended(lead.updatedAt) > 5 ? 'text-red-600' : 'text-gray-600'}`}>
                                                {getDaysUnattended(lead.updatedAt)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 max-w-[150px] truncate" title={lead.email}>
                                            {lead.email}
                                        </td>
                                        <td className="px-4 py-4 text-right print:hidden">
                                            <button 
                                                onClick={(e) => handleDeleteLead(lead.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron leads que coincidan con tu búsqueda
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {showNewLeadModal && (
                <LeadForm
                    onSave={handleSaveLead}
                    onCancel={() => setShowNewLeadModal(false)}
                />
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalLeads)} de {totalLeads} leads
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             Anterior
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-[#BEAF87] text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente 
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
