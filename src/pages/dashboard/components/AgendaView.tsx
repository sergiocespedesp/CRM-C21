import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, X, Trash2, Save, Edit2 } from 'lucide-react';
import type { InteractionType, Lead, AgendaItem } from '../../../types';



interface AgendaViewProps {
    items: AgendaItem[];
    leads: Lead[];
    onAddEvent: (event: Partial<AgendaItem>) => Promise<void>;
    onUpdateEvent: (id: string, updates: Partial<AgendaItem>) => Promise<void>;
    onDeleteEvent: (id: string) => Promise<void>;
}

type ViewMode = 'day' | 'week' | 'month';

const AgendaView: React.FC<AgendaViewProps> = ({ items = [], leads = [], onAddEvent, onUpdateEvent, onDeleteEvent }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AgendaItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormDíata] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        leadId: '',
        color: '#9333ea'
    });

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mi\u00E9', 'Jue', 'Vie', 'S\u00E1b'];
    const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Mi\u00E9rcoles', 'Jueves', 'Viernes', 'S\u00E1bado'];

    const eventColors = [
        { value: '#9333ea', label: 'Morado' },
        { value: '#3b82f6', label: 'Azul' },
        { value: '#10b981', label: 'Verde' },
        { value: '#f59e0b', label: 'Naranja' },
        { value: '#ef4444', label: 'Rojo' },
        { value: '#ec4899', label: 'Rosa' }
    ];

    useEffect(() => {
        if (selectedEvent) {
            setFormDíata({
                title: selectedEvent.title,
                date: selectedEvent.date,
                startTime: selectedEvent.startTime,
                endTime: selectedEvent.endTime,
                description: selectedEvent.description || '',
                leadId: selectedEvent.leadId || '',
                color: selectedEvent.color || '#9333ea'
            });
        }
    }, [selectedEvent]);

    const handleCreateNew = () => {
        setFormDíata({
            title: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            description: '',
            leadId: '',
            color: '#9333ea'
        });
        setSelectedEvent(null);
        setIsEditing(true);
        setIsCreating(true);
        setShowEventModal(true);
    };

    const handleSave = async () => {
        if (isCreating) {
            await onAddEvent(formData);
        } else if (selectedEvent) {
            await onUpdateEvent(selectedEvent.id, formData);
        }
        setShowEventModal(false);
        setIsEditing(false);
        setIsCreating(false);
    };

    const handleDelete = async () => {
        if (selectedEvent) {
            await onDeleteEvent(selectedEvent.id);
            setShowEventModal(false);
        }
    };

    const goToToday = () => setCurrentDate(new Date());
    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };
    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const getWeekDays = (date: Date) => {
        const day = date.getDay();
        const diff = date.getDate() - day;
        const sunday = new Date(date.setDate(diff));
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            return d;
        });
    };

    const getEventsForDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return items.filter(item => item.date === dateStr);
    };

    const getEventStyle = (event: AgendaItem) => {
        const [startH, startM] = event.startTime.split(':').map(Number);
        const [endH, endM] = event.endTime.split(':').map(Number);
        const startMiénutes = startH * 60 + startM;
        const endMiénutes = endH * 60 + endM;
        const duration = endMiénutes - startMiénutes;
        return { top: ((startMiénutes / 60) * 60) + 'px', height: ((duration / 60) * 60) + 'px' };
    };

    const timeSlots = Array.from({ length: 24 }, (_, i) => (i < 10 ? '0' : '') + i + ':00');

    return (        <div className="card bg-gradient-to-br from-white to-gray-50 shadow-lg h-full flex flex-col border border-gray-200">

            <div className="card-header p-4 bg-gradient-to-r from-[#BEAF87] to-[#A89770] text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={goToToday} className="px-3 py-1.5 text-sm font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded transition-all">Hoy</button>
                        <button onClick={goToPrevious} className="p-2 hover:bg-white/20 rounded transition-all"><ChevronLeft size={20} /></button>
                        <button onClick={goToNext} className="p-2 hover:bg-white/20 rounded transition-all"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/20 backdrop-blur-sm rounded p-1">
                        <button onClick={() => setViewMode('day')} className={'px-3 py-1 text-sm font-semibold rounded transition-all ' + (viewMode === 'day' ? 'bg-white text-[#BEAF87] shadow-sm' : 'text-white hover:bg-white/10')}>Día</button>
                        <button onClick={() => setViewMode('week')} className={'px-3 py-1 text-sm font-semibold rounded transition-all ' + (viewMode === 'week' ? 'bg-white text-[#BEAF87] shadow-sm' : 'text-white hover:bg-white/10')}>Semana</button>
                        <button onClick={() => setViewMode('month')} className={'px-3 py-1 text-sm font-semibold rounded transition-all ' + (viewMode === 'month' ? 'bg-white text-[#BEAF87] shadow-sm' : 'text-white hover:bg-white/10')}>Mes</button>
                    </div>
                    <button onClick={handleCreateNew} className="flex items-center gap-2 px-4 py-2 bg-white text-[#BEAF87] rounded-lg hover:bg-gray-100 font-semibold shadow-md transition-all"><Plus size={18} />Nuevo Evento</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 gap-2">
                        {dayNamesShort.map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600 py-2">{day}</div>
                        ))}
                        {Array.from({ length: 35 }, (_, i) => {
                            const dayNum = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
                            const isValidDay = dayNum > 0 && dayNum <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                            return (
                                <div key={i} className={'border rounded p-2 min-h-[80px] hover:bg-gray-50 cursor-pointer ' + (isToday(date) ? 'bg-purple-50' : '')} onClick={() => {
                                    if (isValidDay) {
                                        setFormDíata({
                                            title: '',
                                            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
                                            startTime: '09:00',
                                            endTime: '10:00',
                                            description: '',
                                            leadId: '',
                                            color: '#9333ea'
                                        });
                                        setSelectedEvent(null);
                                        setIsEditing(true);
                                        setIsCreating(true);
                                        setShowEventModal(true);
                                    }
                                }}>
                                    {isValidDay && (
                                        <>
                                            <div className="font-semibold text-right">{dayNum}</div>
                                            {getEventsForDate(date).map(event => (
                                                <div key={event.id} className="text-xs p-1 rounded text-white mt-1 hover:shadow-lg" style={{backgroundColor: event.color}} onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(event);
                                                    setIsEditing(false);
                                                    setIsCreating(false);
                                                    setShowEventModal(true);
                                                }}>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {viewMode === 'week' && (
                    <div className="grid grid-cols-7 gap-2">
                        {getWeekDays(currentDate).map((day, idx) => (
                            <div key={idx} className={'border rounded p-2 min-h-[200px] cursor-pointer hover:bg-gray-50 ' + (isToday(day) ? 'bg-purple-50' : '')} onClick={() => {
                                setFormDíata({
                                    title: '',
                                    date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
                                    startTime: '09:00',
                                    endTime: '10:00',
                                    description: '',
                                    leadId: '',
                                    color: '#9333ea'
                                });
                                setSelectedEvent(null);
                                setIsEditing(true);
                                setIsCreating(true);
                                setShowEventModal(true);
                            }}>
                                <div className="font-semibold text-center mb-2">{dayNamesShort[day.getDay()]} {day.getDate()}</div>
                                <div className="space-y-1">
                                    {getEventsForDate(day).map(event => (
                                        <div key={event.id} className="text-xs p-1 rounded text-white hover:shadow-lg" style={{backgroundColor: event.color}} onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedEvent(event);
                                            setIsEditing(false);
                                            setIsCreating(false);
                                            setShowEventModal(true);
                                        }}>
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {viewMode === 'day' && (
                    <div className="border rounded overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b">
                            <div className="font-bold text-lg">{dayNamesFull[currentDate.getDay()]}, {currentDate.getDate()} de {monthNames[currentDate.getMonth()]}</div>
                        </div>
                        <div className="overflow-auto max-h-[600px]">
                            {timeSlots.map(time => {
                                const hourStr = time.split(':')[0];
                                const hourEvents = getEventsForDate(currentDate).filter(e => {
                                    const eventHour = e.startTime.split(':')[0];
                                    return eventHour === hourStr;
                                });
                                return (
                                    <div key={time} className="flex border-b hover:bg-gray-50">
                                        <div className="w-20 p-2 text-sm text-gray-500 border-r">{time}</div>
                                        <div className="flex-1 p-2 min-h-[60px] cursor-pointer" onClick={() => {
                                            setFormDíata({
                                                title: '',
                                                date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
                                                startTime: time,
                                                endTime: time.split(':')[0] < '23' ? (parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0') + ':00' : '23:59',
                                                description: '',
                                                leadId: '',
                                                color: '#9333ea'
                                            });
                                            setSelectedEvent(null);
                                            setIsEditing(true);
                                            setIsCreating(true);
                                            setShowEventModal(true);
                                        }}>
                                            {hourEvents.map(event => (
                                                <div key={event.id} className="p-2 rounded text-white mb-1 hover:shadow-lg" style={{backgroundColor: event.color}} onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEvent(event);
                                                    setIsEditing(false);
                                                    setIsCreating(false);
                                                    setShowEventModal(true);
                                                }}>
                                                    <div className="font-semibold">{event.title}</div>
                                                    <div className="text-xs opacity-90">{event.startTime} - {event.endTime}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{isCreating ? 'Nuevo Evento' : 'Editar Evento'}</h3>
                            <button onClick={() => setShowEventModal(false)}><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-semibold mb-1">T�tulo</label><input type="text" value={formData.title} onChange={(e) => setFormDíata({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1">Fecha</label><input type="date" value={formData.date} onChange={(e) => setFormDíata({...formData, date: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                                <div><label className="block text-sm font-semibold mb-1">Color</label><select value={formData.color} onChange={(e) => setFormDíata({...formData, color: e.target.value})} className="w-full border rounded px-3 py-2">{eventColors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1">Inicio</label><input type="time" value={formData.startTime} onChange={(e) => setFormDíata({...formData, startTime: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                                <div><label className="block text-sm font-semibold mb-1">Fin</label><input type="time" value={formData.endTime} onChange={(e) => setFormDíata({...formData, endTime: e.target.value})} className="w-full border rounded px-3 py-2" /></div>
                            </div>
                            <div><label className="block text-sm font-semibold mb-1">Lead</label><select value={formData.leadId} onChange={(e) => setFormDíata({...formData, leadId: e.target.value})} className="w-full border rounded px-3 py-2"><option value="">-- No Lead --</option>{leads.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}</select></div>
                            <div><label className="block text-sm font-semibold mb-1">Descripci�n</label><textarea value={formData.description} onChange={(e) => setFormDíata({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2" rows={3} /></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button onClick={() => setShowEventModal(false)} className="btn btn-ghost">Cancelar</button>
                            <button onClick={handleSave} className="btn btn-primary"><Save size={16} />Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaView;