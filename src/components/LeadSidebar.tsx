import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Clock, MessageSquare, Plus, Save, Building2, User, Trash2 } from 'lucide-react';
import type { Lead, Interaction, LeadTemperature, PipelineStage, Advisor, Property, InteractionType } from '../types';
import { LeadService } from '../services/leadService';
import { PropertyService } from '../services/propertyService';

interface LeadSidebarProps {
    lead: Lead;
    properties: Property[]; 
    advisors: Advisor[];    
    onClose: () => void;
    onUpdate: () => void;
}

const LeadSidebar: React.FC<LeadSidebarProps> = ({ lead, properties, advisors, onClose, onUpdate }) => {
    const [interactions, setInteractions] = useState<Interaction[]>([]);

    const [newInteraction, setNewInteraction] = useState({
        type: 'NOTE' as const,
        content: ''
    });

    const [showInterestModal, setShowInterestModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [availableUnits, setAvailableUnits] = useState<any[]>([]);

    const [nextActionState, setNextActionState] = useState({
        action: '',
        date: ''
    });

    useEffect(() => {
        setNextActionState({
            action: lead.nextAction || '',
            date: lead.nextActionDate ? new Date(lead.nextActionDate).toISOString().slice(0, 16) : ''
        });
    }, [lead]);

    useEffect(() => {
        loadInteractions();
    }, [lead.id]);

    const loadInteractions = async () => {
        try {
            const data = await LeadService.getInteractionsByLeadId(lead.id);
            setInteractions(data);
        } catch (error) {
            console.error('Error loading interactions:', error);
        }
    };

    const handleUpdateField = async (field: keyof Lead, value: any) => {
        try {
            await LeadService.updateLead(lead.id, { [field]: value });
            onUpdate();
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInteraction.content.trim()) return;

        try {
            await LeadService.addInteraction({
                leadId: lead.id,
                type: newInteraction.type,
                content: newInteraction.content,
                advisorId: lead.advisorId
            });
            setNewInteraction({ ...newInteraction, content: '' });
            await loadInteractions();
            onUpdate();
        } catch (error) {
            console.error('Error adding interaction:', error);
        }
    };

        const handleAddInterest = async () => {
        if (!selectedPropertyId) return;
        try {
            const prop = properties.find(p => p.id === selectedPropertyId);
            const interestText = prop ? prop.name : 'Inmueble desconocido';
            
            await LeadService.updateLead(lead.id, { interest: interestText });

            onUpdate();
            setShowInterestModal(false);
            setSelectedPropertyId('');
            setSelectedUnitId('');
        } catch (error) {
            console.error('Error adding interest:', error);
        }
    };

    const handleDeleteInterest = async () => {
        if (!confirm('¿Estás seguro de quitar este inmueble de interés?')) return;
        try {
            await LeadService.updateLead(lead.id, { interest: '' }); // Clear it
            onUpdate();
        } catch (error) {
            console.error('Error deleting interest:', error);
        }
    };

const handleSaveNextAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nextActionState.action.trim() || !nextActionState.date) {
            console.warn("Faltan datos para la próxima acción");
            return;
        }
        
        try {
            console.log("Guardando próxima acción para lead:", lead.id);
            // 1. Guardar como una interacción de tipo NEXT_ACTION usando LeadService
            await LeadService.addInteraction({
                leadId: lead.id,
                type: 'NEXT_ACTION',
                content: `${nextActionState.action} | Programado para: ${new Date(nextActionState.date).toLocaleString()}`,
                advisorId: lead.advisorId
            });
            
            // 2. Actualizar los campos del lead para visualización rápida en tablas
            await LeadService.updateLead(lead.id, {
                nextAction: nextActionState.action,
                nextActionDate: new Date(nextActionState.date).toISOString()
            });
            
            // 3. Limpiar estado local y recargar interacciones
            setNextActionState({ action: '', date: '' });
            await loadInteractions(); // Recarga la lista de interacciones local
            onUpdate(); // Notifica al componente padre (Dashboard/Leads) que hubo cambios
            console.log("Próxima acción guardada con éxito");
        } catch (error) {
            console.error('Error saving next action:', error);
            alert("Error al guardar la próxima acción");
        }
    };

    useEffect(() => {
        if (selectedPropertyId) {
            const loadUnits = async () => {
                const units = await PropertyService.getAllUnits();
                setAvailableUnits(units.filter(u => u.propertyId === selectedPropertyId && u.status === 'AVAILABLE'));
            };
            loadUnits();
        } else {
            setAvailableUnits([]);
        }
    }, [selectedPropertyId]);

    const stages: { id: PipelineStage; label: string }[] = [
        { id: 'NEW', label: 'Lead Recibido' },
        { id: 'INFO_SENT', label: 'Envió Información' },
        { id: 'CONTACTED', label: 'En Seguimiento' },
        { id: 'PRESENTATION', label: 'Presentación' },
        { id: 'VISIT', label: 'Visita' },
        { id: 'NEGOTIATION', label: 'Negociación' },
        { id: 'CLOSED_WON', label: 'Vendido' },
        { id: 'DISCARDED', label: 'Descartado' }
    ];

    const interactionTypes: { id: InteractionType; label: string }[] = [
        { id: 'NOTE', label: 'Nota' },
        { id: 'CALL', label: 'Llamada' },
        { id: 'WHATSAPP', label: 'WhatsApp' },
        { id: 'EMAIL', label: 'Correo' },
        { id: 'MEETING', label: 'Reunión' },
    ];

	const getBudgetLabel = (budget: string) => {
		const labels: Record<string, string> = {
			'under_50k': 'Menos de $50k',
			'50k_100k': '$50k - $100k',
			'100k_200k': '$100k - $200k',
			'200k_500k': '$200k - $500k',
			'over_500k': 'Más de $500k'
		};
		return labels[budget] || budget;
	};
	const getTimingLabel = (timing: string) => {
		const labels: Record<string, string> = {
			'immediate': 'Inmediato',
			'1_3_months': '1-3 meses',
			'3_6_months': '3-6 meses',
			'exploring': 'Explorando'
		};
		return labels[timing] || timing;
	};
    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--border-color)] flex flex-col">
            <div className="p-6 border-b border-[var(--border-light)] bg-gray-50 flex justify-between items-start">
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm cursor-pointer ${lead.temperature === 'HOT' ? 'bg-red-500' :
                        lead.temperature === 'WARM' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        title="Clic para cambiar temperatura"
                        onClick={() => {
                            const temps: LeadTemperature[] = ['COLD', 'WARM', 'HOT'];
                            const next = temps[(temps.indexOf(lead.temperature) + 1) % temps.length];
                            handleUpdateField('temperature', next);
                        }}
                    >
                        {(lead.firstName || '').charAt(0)}{(lead.lastName || '').charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-[var(--text-main)]">{lead.firstName} {lead.lastName}</h2>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <select
                                value={lead.stage}
                                onChange={(e) => handleUpdateField('stage', e.target.value)}
                                className="text-xs font-bold uppercase py-1 px-2 rounded border border-[var(--border-light)] bg-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none cursor-pointer"
                            >
                                {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>

                            <div className="relative">
                                <select
                                    value={lead.advisorId}
                                    onChange={(e) => handleUpdateField('advisorId', e.target.value)}
                                    className="w-full text-xs py-1 px-2 pl-6 rounded border border-[var(--border-light)] bg-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none cursor-pointer appearance-none"
                                >
                                    {advisors.map(adv => <option key={adv.id} value={adv.id}>{adv.name}</option>)}
                                </select>
                                <User size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-[var(--text-muted)]">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                <div className="p-6 space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded border border-[var(--border-light)] shadow-sm">
                            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                                <Phone size={10} /> Teléfono
                            </div>
                            <div className="text-sm font-medium">{lead.phone}</div>
                        </div>
                        <div className="p-3 bg-white rounded border border-[var(--border-light)] shadow-sm">
                            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                                <Mail size={10} /> Email
                            </div>
                            <div className="text-sm font-medium truncate" title={lead.email}>{lead.email}</div>
                        </div>
                        <div className="p-3 bg-white rounded border border-[var(--border-light)] shadow-sm col-span-2">
                            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1 flex items-center gap-1">
                                <MapPin size={10} /> Ubicación (Editable)
                            </div>
                            <input
                                type="text"
                                value={lead.city}
                                onBlur={(e) => {
                                    if (e.target.value !== lead.city) handleUpdateField('city', e.target.value);
                                }}
                                onChange={() => {
                                }}
                                readOnly={false}
                                defaultValue={lead.city}
                                className="w-full text-sm border-none focus:ring-0 p-0 m-0 font-medium text-[var(--text-main)] placeholder-gray-400"
                                placeholder="Ciudad..."
                            />
                        </div>
                    </div>
					{/* Qualification Info */}
					{(lead.budget || lead.preferredZone || lead.timing) && (
						<div className="border-t pt-4 mt-4">
							<h3 className="font-semibold mb-3 text-gray-700">Calificación</h3>
							<div className="space-y-2">
								{lead.budget && (
									<div>
										<span className="text-sm text-gray-500">Presupuesto:</span>
										<p className="font-medium">{getBudgetLabel(lead.budget)}</p>
									</div>
								)}
								{lead.preferredZone && (
									<div>
										<span className="text-sm text-gray-500">Zona de Interés:</span>
										<p className="font-medium">{lead.preferredZone}</p>
									</div>
								)}
								{lead.timing && (
									<div>
										<span className="text-sm text-gray-500">Timing:</span>
										<p className="font-medium">{getTimingLabel(lead.timing)}</p>
									</div>
								)}
							</div>
						</div>
					)}
                    <div className="bg-white rounded-lg shadow-sm border border-[var(--border-light)] overflow-hidden">
                        <div className="p-3 border-b border-[var(--border-light)] flex justify-between items-center bg-gray-50">
                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">
                                Inmuebles de Interés ({lead.interest ? 1 : 0})
                            </h3>
                            <button
                                onClick={() => setShowInterestModal(true)}
                                className="text-[var(--color-primary)] hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Vincular Inmueble"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="p-0">
                            {!lead.interest && (
                                <p className="text-center text-xs text-gray-400 py-4">No hay inmuebles vinculados.</p>
                            )}
                            <div className="divide-y divide-gray-100">
                                {lead.interest && (
                                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                            <Building2 size={16} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-sm text-[var(--text-main)] truncate">
                                                {lead.interest}
                                            </h4>
                                        </div>
                                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeleteInterest()}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 transition-opacity"
                                                title="Quitar"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-[var(--border-light)] overflow-hidden">
                        <div className="p-3 border-b border-[var(--border-light)] bg-gray-50">
                            <h3 className="text-xs font-bold uppercase text-[var(--text-muted)]">
                                Acciones
                            </h3>
                        </div>

                        <div className="p-4 space-y-4">
                            <form onSubmit={handleAddInteraction} className="flex flex-col gap-2 bg-gray-50 p-3 rounded border border-[var(--border-light)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] focus-within:border-[var(--color-primary)] transition-all">
                                <textarea
                                    value={newInteraction.content}
                                    onChange={e => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                    placeholder="Acciones realizadas..."
                                    className="w-full text-sm resize-none border-none bg-transparent focus:ring-0 p-0"
                                    rows={2}
                                    />
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <select
                                        value={newInteraction.type}
                                        onChange={e => setNewInteraction({ ...newInteraction, type: e.target.value as any })}
                                        className="text-xs border-none bg-transparent focus:ring-0 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-main)]"
                                    >
                                        {interactionTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn btn-xs btn-primary">Guardar</button>
                                </div>
                            </form>

                            <div className="space-y-4 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
                                {interactions.filter(i => i.type !== 'NEXT_ACTION').length === 0 && <p className="text-center text-xs text-gray-400 py-4 pl-6">No hay acciones aún.</p>}
                                {interactions.filter(i => i.type !== 'NEXT_ACTION').slice().reverse().map((interaction) => {
                                    const advisorName = advisors.find(a => a.id === interaction.advisorId)?.name || interaction.advisorId;
                                    const typeLabel = interactionTypes.find(t => t.id === interaction.type)?.label || interaction.type;

                                    return (
                                        <div key={interaction.id} className="relative pl-8">
                                            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] z-10 border-2 border-white ${interaction.type === 'CALL' ? 'bg-blue-400' :
                                                interaction.type === 'WHATSAPP' ? 'bg-green-400' :
                                                    interaction.type === 'MEETING' ? 'bg-purple-400' : 'bg-gray-400'
                                                }`}>
                                                {interaction.type === 'NOTE' ? <MessageSquare size={12} /> :
                                                    interaction.type === 'CALL' ? <Phone size={12} /> :
                                                        interaction.type === 'WHATSAPP' ? <MessageSquare size={12} /> : <Calendar size={12} />}
                                            </div>
                                            <div className="bg-white p-3 rounded border border-[var(--border-light)] hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs text-gray-700 flex items-center gap-1">
                                                        {advisorName}
                                                        <span className="font-normal text-gray-400">•</span>
                                                        <span className="text-[10px] font-normal text-gray-500 uppercase">{typeLabel}</span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{new Date(interaction.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{interaction.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-[var(--border-light)] overflow-hidden">
                        <div className="p-3 border-b border-[var(--border-light)] bg-purple-50">
                            <h3 className="text-xs font-bold uppercase text-purple-700 flex items-center gap-2">
                                <Calendar size={14} />
                                Próximas Acciones
                            </h3>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Form to add new next action */}
                            <form onSubmit={handleSaveNextAction} className="flex flex-col gap-2 bg-purple-50 p-3 rounded border border-purple-200 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                                <textarea
                                    value={nextActionState.action}
                                    onChange={e => setNextActionState({ ...nextActionState, action: e.target.value })}
                                    placeholder="Ej: Llamar para confirmar cita..."
                                    className="w-full text-sm resize-none border-none bg-transparent focus:ring-0 p-0"
                                    rows={2}
                                />
                                <div className="flex justify-between items-center pt-2 border-t border-purple-200 gap-2">
                                    <input
                                        type="datetime-local"
                                        value={nextActionState.date}
                                        onChange={e => setNextActionState({ ...nextActionState, date: e.target.value })}
                                        className="text-xs border-none bg-transparent focus:ring-0 text-[var(--text-muted)] flex-1"
                                    />
                                    <button type="submit" className="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white border-none">
                                        <Save size={12} className="mr-1" />
                                        Guardar
                                    </button>
                                </div>
                            </form>

                            {/* Timeline of next actions */}
                            <div className="space-y-4 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-purple-200">
                                {interactions.filter(i => i.type === 'NEXT_ACTION').length === 0 && <p className="text-center text-xs text-gray-400 py-4 pl-6">No hay próximas acciones registradas.</p>}
                                {interactions.filter(i => i.type === 'NEXT_ACTION').slice().reverse().map((interaction) => {
                                    const advisorName = advisors.find(a => a.id === interaction.advisorId)?.name || interaction.advisorId;
                                    
                                    return (
                                        <div key={interaction.id} className="relative pl-8">
                                            <div className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] z-10 border-2 border-white bg-purple-500">
                                                <Calendar size={12} />
                                            </div>
                                            <div className="bg-white p-3 rounded border border-purple-200 hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs text-purple-700 flex items-center gap-1">
                                                        {advisorName}
                                                        <span className="font-normal text-gray-400">•</span>
                                                        <span className="text-[10px] font-normal text-gray-500 uppercase">Próxima Acción</span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">{new Date(interaction.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">{interaction.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {showInterestModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded shadow-lg w-full max-w-sm border-t-4 border-[var(--color-info)]">
                        <div className="p-4 border-b border-[var(--border-light)]">
                            <h4 className="font-bold text-[var(--text-main)]">Vinculación a Inmueble</h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Inmueble</label>
                                <select
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedPropertyId}
                                    onChange={e => {
                                        setSelectedPropertyId(e.target.value);
                                        setSelectedUnitId('');
                                    }}
                                >
                                    <option value="">Seleccionar Inmueble...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedPropertyId && properties.find(p => p.id === selectedPropertyId)?.type === 'PROJECT' && (
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Unidad (Opcional)</label>
                                    <select
                                        className="w-full p-2 border rounded text-sm"
                                        value={selectedUnitId}
                                        onChange={e => setSelectedUnitId(e.target.value)}
                                    >
                                        <option value="">Seleccionar Unidad...</option>
                                        {availableUnits.map(u => (
                                            <option key={u.id} value={u.id}>
                                                Unidad {u.unitNumber} - ${u.price.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowInterestModal(false)}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddInterest}
                                    disabled={!selectedPropertyId}
                                    className="btn btn-info text-white btn-sm"
                                >
                                    Vincular
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LeadSidebar;
