import { isOverdue } from '../utils/taskUtils';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare, 
  Thermometer,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { InteractionService } from '../services/InteractionService';
import { LeadService } from '../services/leadService';
import AgendaView from './dashboard/components/AgendaView';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAnalytics } from '../hooks/useAnalytics';
import { AdvisorService } from '../services/advisorService';
import { PipelineOverview } from '../components/PipelineOverview';
import type { Lead, Interaction, AgendaItem, Advisor } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, highPriorityLeads, upcomingActions, recentActivity, loading } = useDashboardData();
  const [agendaEvents, setAgendaEvents] = useState<AgendaItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'analytics'>('dashboard');

  // Fix: Hook called unconditionally
  const analytics = useAnalytics(leads, agendaEvents, advisors);

  useEffect(() => {
    loadAgendaData();
  }, []);

  const loadAgendaData = async () => {
    try {
      const [leadsData, interactions, advisorsData] = await Promise.all([
        LeadService.getAllLeads(),
        InteractionService.getAllInteractions(),
        AdvisorService.getAllAdvisors()
      ]);
      setLeads(leadsData);
      setAdvisors(advisorsData);

      const events: AgendaItem[] = [];

      // Add NEXT_ACTION events from leads
      leadsData.forEach(lead => {
        if (lead.nextActionDate && lead.nextAction) {
            console.log('Found lead with action:', lead.nextActionDate);
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
                type: 'NEXT_ACTION',
                leadId: lead.id,
                leadName: `${lead.firstName} ${lead.lastName}`,
                description: `Acción programada: ${lead.nextAction}`,
                color: '#BEAF87'
            });
        }
      });

      // Add interactions (including calendar events)
      interactions.forEach(int => {
        const lead = leadsData.find(l => l.id === int.leadId);
        const leadName = lead ? `${lead.firstName} ${lead.lastName}` : '';
        const dateObj = new Date(int.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTimeObj = new Date(dateObj.getTime() + 30*60000);
        const endTimeStr = endTimeObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

        // For calendar events without a lead, use the content as title
        // For interactions with a lead, use the type + lead name format
        let title = int.content || 'Evento sin título';
        if (leadName) {
          const typeLabel = (({ 'CALL': 'Llamada', 'NOTE': 'Nota', 'EMAIL': 'Email', 'MEETING': 'Reunión', 'NEXT_ACTION': 'Próx. Acción', 'VISIT': 'Visita', 'WHATSAPP': 'WhatsApp', 'MESSENGER': 'Messenger' } as any)[int.type] || int.type);
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
          color: leadName ? '#1A1A1A' : '#9333ea' // Purple for general events, black for lead events
        });
      });

      setAgendaEvents(events);
    } catch (error) {
      console.error('Error loading agenda data:', error);
    }
  };

  const handleAddEvent = async (event: Partial<AgendaItem>) => {
    try {
      // Create a new calendar event as an interaction
      await InteractionService.addInteraction({
        leadId: event.leadId || '', // Can be empty for general events
        advisorId: '', // Could be set to current user if auth is implemented
        type: 'NEXT_ACTION', // Using NEXT_ACTION type for calendar events
        origin: 'MANUAL',
        date: `${event.date}T${event.startTime}:00`,
        content: event.title || 'Evento sin título',
        notes: event.description || ''
      });
      await loadAgendaData(); // Reload to show the new event
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error al guardar el evento');
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<AgendaItem>) => {
    try {
      // Extract the original interaction ID (remove 'int-' prefix if present)
      const interactionId = id.startsWith('int-') ? id.substring(4) : id;
      
      await InteractionService.updateInteraction(interactionId, {
        content: updates.title,
        notes: updates.description,
        date: updates.date ? `${updates.date}T${updates.startTime || '00:00'}:00` : undefined,
        leadId: updates.leadId
      });
      await loadAgendaData();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Error al actualizar el evento');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      // Extract the original interaction ID
      const interactionId = id.startsWith('int-') ? id.substring(4) : id;
      
      await InteractionService.deleteInteraction(interactionId);
      await loadAgendaData();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50/50 rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87]"></div>
          <p className="text-gray-500 font-medium italic">Preparando tu panel de control...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'gold',
      link: '/leads?filter=all'
    },
    {
      title: 'Leads Calientes',
      value: stats.hotLeads,
      change: '+5.2%',
      trend: 'up',
      icon: Thermometer,
      color: 'red',
      link: '/leads?filter=hot'
    },
    {
      title: 'Leads Tibios',
      value: stats.warmLeads,
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'orange',
      link: '/leads?filter=warm'
    },
    {
      title: 'Atrasados',
      value: stats.overdueLeads,
      change: '15 hoy',
      trend: 'neutral',
      icon: AlertCircle,
      color: 'black',
      link: '/leads?filter=overdue'
    }
  ];

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'Llamada': return Phone;
      case 'Email': return Mail;
      case 'WhatsApp': return MessageSquare;
      default: return Clock;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'HOT': return 'text-red-600 bg-red-50 border-red-100';
      case 'WARM': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'COLD': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-6">
      {/* Header section with date display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {viewMode === 'dashboard' ? 'Dashboard General' : 'Analytics'}
          </h1>
          <p className="text-gray-500 mt-1">
            {viewMode === 'dashboard' ? 'Bienvenido de nuevo al panel de Century 21' : 'Análisis y métricas de rendimiento'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-[#BEAF87] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === 'analytics'
                  ? 'bg-[#BEAF87] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <Calendar className="w-5 h-5 text-[#BEAF87]" />
          <span className="text-sm font-semibold text-gray-700">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      </div>

      {viewMode === 'dashboard' ? (
        <>
          {/* KPI Stats Cards - Compact Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div 
                  key={index}
                  onClick={() => navigate(card.link)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
                >
                  <div className={`p-2.5 rounded-lg ${
                    card.color === 'gold' ? 'bg-[#BEAF87]/10 text-[#BEAF87]' :
                    card.color === 'red' ? 'bg-red-50 text-red-600' :
                    card.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    'bg-gray-100 text-gray-900'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate mb-0.5">{card.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold text-gray-900 leading-none">{card.value}</h3>
                      <span className={`text-[10px] font-bold flex items-center ${
                        card.trend === 'up' ? 'text-green-600' : 
                        card.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : 
                         card.trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : null}
                        {card.change}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Dashboard Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Row 1: Left - High Priority Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#BEAF87]/10 rounded-lg">
                    <Users className="w-5 h-5 text-[#BEAF87]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Prioridad Alta</h2>
                </div>
                <span className="bg-[#BEAF87] text-white text-[10px] px-2.5 py-1 rounded-full font-black">
                  {highPriorityLeads.length} PENDIENTES
                </span>
              </div>
              <div className="p-5 max-h-[420px] overflow-y-auto custom-scrollbar">
                {highPriorityLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm italic">No hay leads de alta prioridad hoy</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {highPriorityLeads.map((lead) => (
                      <div key={lead.id} className="group p-4 rounded-xl border border-gray-100 hover:border-[#BEAF87]/30 hover:bg-gray-50/80 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border-2 border-white shadow-sm group-hover:from-[#BEAF87]/20 group-hover:to-[#BEAF87]/10 transition-colors">
                              {lead.firstName[0]}{lead.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-[#BEAF87] transition-colors">{lead.firstName} {lead.lastName}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Actualizado hace 2h
                              </p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getTemperatureColor(lead.temperature)} shadow-sm`}>
                            {lead.temperature === 'HOT' ? 'CALIENTE' : lead.temperature === 'WARM' ? 'TIBIO' : 'FRÍO'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                          <p className="text-xs text-gray-500 font-medium">Interés: <span className="text-gray-700">Residencial</span></p>
                          <button 
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="text-xs font-bold text-[#BEAF87] flex items-center gap-1 hover:gap-2 transition-all"
                          >
                            DETALLE
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 1: Right - Agenda / Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px]">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Agenda Semanal</h2>
                </div>
              </div>
              <div className="p-5 flex-1">
                <AgendaView
                  items={agendaEvents}
                  leads={leads}
                  onAddEvent={handleAddEvent}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              </div>
            </div>

            {/* Row 2: Left - Upcoming Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Próximas Acciones</h2>
                </div>
              </div>
              <div className="p-5 max-h-[420px] overflow-y-auto custom-scrollbar">
                {upcomingActions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm italic">No hay acciones programadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingActions.map((action, idx) => {
                      const isOverdue = new Date(action.date) < new Date();
                      return (
                        <div 
                          key={idx} 
                          className={`group p-4 rounded-xl border transition-all duration-300 ${
                            isOverdue 
                              ? 'bg-red-50/50 border-red-100 hover:border-red-300' 
                              : 'bg-white border-gray-100 hover:border-[#BEAF87]/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className={`mt-1 p-2 rounded-lg ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} group-hover:scale-110 transition-transform`}>
                                {React.createElement(getInteractionIcon(action.type), { className: "w-4 h-4" })}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm leading-tight">{action.title}</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{action.leadName}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${isOverdue ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
                                    {isOverdue ? 'ATRASADO' : 'HOY'}
                                  </span>
                                  <span className="text-[11px] text-gray-400 font-medium">
                                    {new Date(action.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 bg-[#BEAF87] text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all transform translate-x-2 group-hover:translate-x-0">
                              GESTIONAR
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Right - Pipeline Overview */}
            <PipelineOverview />

          </div>
        </>
      ) : (
        <AnalyticsDashboard {...analytics} />
      )}
    </div>
  );
};

export default Dashboard;
