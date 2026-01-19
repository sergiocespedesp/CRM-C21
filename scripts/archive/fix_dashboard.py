import os

code = """import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Phone,
    Mail,
    MessageSquare,
    Clock,
    Thermometer,
    AlertCircle
} from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import AgendaView from './dashboard/components/AgendaView';
import type { AgendaItem } from './dashboard/components/AgendaView';
import { LeadService } from '../services/leadService';
import { InteractionService } from '../services/InteractionService';
import type { Lead } from '../types';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stats, highPriorityLeads, recentActivity, upcomingActions, loading } = useDashboardData();
    
    const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        loadAgendaData();
    }, [user]);

    const loadAgendaData = async () => {
        try {
            // Cargar leads
            let allLeads: Lead[];
            if (user?.role === 'ADVISOR' && user.advisorId) {
                allLeads = await LeadService.getLeadsByAdvisor(user.advisorId);
            } else {
                allLeads = await LeadService.getAllLeads();
            }
            setLeads(allLeads);

            // Cargar eventos del calendario desde las interacciones de tipo NEXT_ACTION
            const interactions = await InteractionService.getAllInteractions();
            const interactionEvents: AgendaItem[] = interactions
                .filter(i => i.type === 'NEXT_ACTION' && i.details?.date && i.details?.startTime)
                .map(i => {
                    const lead = allLeads.find(l => l.id === i.leadId);
                    return {
                        id: i.id,
                        title: i.content || 'Evento',
                        date: i.details.date,
                        startTime: i.details.startTime || '09:00',
                        endTime: i.details.endTime || '10:00',
                        type: 'NEXT_ACTION' as const,
                        leadName: lead ? ${lead.firstName}  : undefined,
                        leadId: i.leadId,
                        description: i.notes,
                        color: i.details.color || '#B8860B'
                    };
                });

            // Cargar eventos desde las próximas acciones de los leads
            const leadNextActionEvents: AgendaItem[] = allLeads
                .filter(l => l.nextAction && l.nextActionDate)
                .map(l => {
                    try {
                        const dateObj = new Date(l.nextActionDate!);
                        const dateStr = dateObj.toISOString().split('T')[0];
                        const timeStr = dateObj.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
                        
                        const endObj = new Date(dateObj);
                        endObj.setHours(endObj.getHours() + 1);
                        const endTimeStr = endObj.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });

                        return {
                            id: f"lead-action-{l.id}",
                            title: l.nextAction || 'Próxima Acción',
                            date: dateStr,
                            startTime: timeStr,
                            endTime: endTimeStr,
                            type: 'NEXT_ACTION' as const,
                            leadName: f"{l.firstName} {l.lastName}",
                            leadId: l.id,
                            description: f"Acción pendiente para el lead {l.firstName}",
                            color: '#B8860B'
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter(e => e !== null) as AgendaItem[];

            setAgendaItems([...interactionEvents, ...leadNextActionEvents]);
        } catch (error) {
            console.error('Error loading agenda data:', error);
        }
    };

    const handleAddEvent = async (event: Partial<AgendaItem>) => {
        try {
            await InteractionService.addInteraction({
                leadId: event.leadId || '',
                type: 'NEXT_ACTION',
                origin: 'MANUAL',
                content: event.title || 'Nuevo evento',
                advisorId: user?.advisorId || 'adv-1',
                notes: event.description,
                details: {
                    date: event.date,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    color: event.color
                }
            });
            await loadAgendaData();
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handleUpdateEvent = async (id: string, updates: Partial<AgendaItem>) => {
        try {
            console.log('Update event:', id, updates);
            await loadAgendaData();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            console.log('Delete event:', id);
            await loadAgendaData();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando aplicación...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Leads',
            value: stats.totalLeads,
            change: '+12%',
            icon: Users,
            color: 'bg-blue-500',
            trend: 'up',
            link: '/leads'
        },
        {
            title: 'Leads Calientes',
            value: stats.hotLeads,
            change: '+8%',
            icon: Thermometer,
            color: 'bg-red-500',
            trend: 'up',
            link: '/leads?filter=hot'
        },
        {
            title: 'Leads Tibios',
            value: stats.warmLeads,
            change: '+5%',
            icon: TrendingUp,
            color: 'bg-orange-400',
            trend: 'up',
            link: '/leads?filter=warm'
        },
        {
            title: 'Atrasados (+5 días)',
            value: stats.overdue,
            change: '-3%',
            icon: AlertCircle,
            color: 'bg-yellow-500',
            trend: 'down',
            link: '/leads?filter=overdue'
        }
    ];

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone className="w-4 h-4" />;
            case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />;
            case 'EMAIL': return <Mail className="w-4 h-4" />;
            case 'MEETING': return <Calendar className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getTemperatureColor = (temp: string) => {
        switch (temp) {
            case 'HOT': return 'text-red-600 bg-red-50';
            case 'WARM': return 'text-orange-600 bg-orange-50';
            case 'COLD': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Mañana';
        if (diffDays === -1) return 'Ayer';
        if (diffDays < 0) return f"Hace {Math.abs(diffDays)} días";
        return f"En {diffDays} días";
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Dashboard {user?.role === 'ADVISOR' ? f"- {user.name}" : ''}
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {user?.role === 'ADMIN' 
                            ? 'Vista general del sistema' 
                            : 'Resumen de tus leads y actividades'}
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    {new Date().toLocaleDateString('es-BO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>

            {/* Stats Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div 
                        key={index} 
                        onClick={() => navigate(stat.link)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={${stat.color} p-2.5 rounded-lg shadow-inner}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">{stat.title}</h3>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                            </div>
                            <div className={	ext-xs font-bold px-2 py-1 rounded-full }>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 1: High Priority Leads and Agenda */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High Priority Leads */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Prioridad Alta</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#B8860B]/10 text-[#B8860B] text-xs font-bold uppercase tracking-wider">
                            {highPriorityLeads.length} leads
                        </span>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {highPriorityLeads.length === 0 ? (
                            <div className="py-12 text-center">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No hay leads de alta prioridad</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {highPriorityLeads.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-[#B8860B]/30 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#B8860B] to-[#9A7209] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                {lead.firstName[0]}{lead.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-[#B8860B] transition-colors">
                                                    {lead.firstName} {lead.lastName}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-500 font-medium">{lead.phone}</span>
                                                    <span className={inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase }>
                                                        <Thermometer className="w-2.5 h-2.5" />
                                                        {lead.temperature === 'HOT' ? 'Caliente' : lead.temperature === 'WARM' ? 'Tibio' : 'Frío'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigate(f"/leads/{lead.id}")}
                                            className="ml-3 px-3 py-1.5 text-xs font-bold text-[#B8860B] bg-[#B8860B]/5 hover:bg-[#B8860B]/10 rounded-lg transition-colors border border-[#B8860B]/20"
                                        >
                                            Detalle
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar/Agenda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Agenda</h2>
                    </div>
                    <div className="p-2 flex-1">
                        <AgendaView 
                            items={agendaItems}
                            leads={leads}
                            onAddEvent={handleAddEvent}
                            onUpdateEvent={handleUpdateEvent}
                            onDeleteEvent={handleDeleteEvent}
                        />
                    </div>
                </div>
            </div>

            {/* Row 2: Upcoming Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800">Próximas Acciones</h2>
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {upcomingActions.length === 0 ? (
                            <div className="py-12 text-center">
                                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No hay acciones programadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingActions.map((action) => {
                                    const isOverdue = new Date(action.date) < new Date();
                                    return (
                                        <div 
                                            key={action.id} 
                                            className={p-3 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md cursor-pointer group }
                                            onClick={() => navigate(f"/leads/{action.leadId}")}
                                        >
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className={mt-0.5 rounded-full p-1 }>
                                                    {isOverdue ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-[#B8860B]" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#B8860B]">
                                                        {action.leadName}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{action.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-gray-50 pt-2 mt-2">
                                                <span className={	ext-[10px] font-bold uppercase tracking-wider }>
                                                    {formatDate(action.date)}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#B8860B] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    GESTIONAR 
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Actividad Reciente</h2>
                    </div>
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {recentActivity.length === 0 ? (
                            <div className="py-12 text-center">
                                <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No hay actividad reciente</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-1">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shadow-sm">
                                            {getInteractionIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 border-b border-gray-50 pb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <button
                                                    onClick={() => navigate(f"/leads/{activity.leadId}")}
                                                    className="font-bold text-sm text-gray-900 hover:text-[#B8860B] transition-colors truncate"
                                                >
                                                    {activity.leadName}
                                                </button>
                                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(activity.date).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/50 p-2 rounded-lg italic border border-gray-50/50">
                                                "{activity.content}"
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                    {activity.type === 'CALL' ? 'Llamada' :
                                                        activity.type === 'WHATSAPP' ? 'WhatsApp' :
                                                            activity.type === 'EMAIL' ? 'Email' :
                                                                activity.type === 'MEETING' ? 'Reunión' : 'Nota'}
                                                </span>
                                                <span className="text-[10px] text-gray-300 font-bold"></span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(activity.date).toLocaleDateString('es-BO', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;"""

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
