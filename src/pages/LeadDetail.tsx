import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Phone,
    Mail,
    MessageSquare,
    Calendar,
    MapPin,
    Thermometer,
    User,
    Building2,
    Clock,
    Edit,
    Save,
    X,
    Plus,
    ExternalLink
} from 'lucide-react';
import { useLead, useUpdateLead, useAddInterest } from '../hooks/useLeads';
import { useProperties } from '../hooks/useProperties';
import { useAdvisors } from '../hooks/useAdvisors';
import { useAddInteraction, useCreateVisitInteraction } from '../hooks/useInteractions';
import type { Lead, Interaction, Property, Advisor, Interest, PipelineStage, LeadTemperature, InteractionType, VisitChecklist } from '../types';
import { VisitChecklistModal } from '../components/VisitChecklistModal';

const LeadDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // React Query Hooks
    const { data: lead, isLoading: loading } = useLead(id || "");
    const { data: properties = [] } = useProperties();
    const { data: units = [] } = useUnits();
    const { data: advisors = [] } = useAdvisors();

    // Mutations
    const updateLead = useUpdateLead();
    const addInteraction = useAddInteraction();
    const createVisit = useCreateVisitInteraction();
    const addInterest = useAddInterest();

    // Interactions - derived from lead data
    const interactions = React.useMemo(() => {
        if (!lead?.interactions) return [];
        return [...lead.interactions].filter((i: Interaction) => i.type !== 'NEXT_ACTION').sort((a: Interaction, b: Interaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [lead?.interactions]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Lead>>({});
    
    // Initialize edit form
    useEffect(() => {
        if (lead) {
            setEditForm(lead);
        }
    }, [lead]);

    // Modal state
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [newInteraction, setNewInteraction] = useState({
        type: "NOTE" as InteractionType,
        content: "",
        notes: ""
    });
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [showVisitModal, setShowVisitModal] = useState(false);

    const handleSaveEdit = async () => {
        if (!lead || !id) return;
        try {
            const { interactions, advisor, interests, id: _, createdAt, updatedAt, ...cleanData } = editForm;
            await updateLead.mutateAsync({ id, data: cleanData });
            toast.success('Lead actualizado exitosamente');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating lead:', error);
            toast.error('Error al actualizar el lead');
        }
    };

    const handleAddInteraction = async () => {
        if (!lead || !newInteraction.content.trim()) return;
        try {
            const result = await addInteraction.mutateAsync({
                leadId: lead.id,
                type: newInteraction.type,
                // origin: 'MANUAL',
                content: newInteraction.content,
                advisorId: lead.advisorId,
                notes: newInteraction.notes
            });
            toast.success('Interacción agregada exitosamente');
            setNewInteraction({ type: 'NOTE', content: '', notes: '' });
            setShowInteractionModal(false);
            
        } catch (error) {
            console.error('Error adding interaction:', error);
            alert('Error al agregar la Interacción');
        }
    };



    const handleSaveVisit = async (checklist: VisitChecklist) => {
        if (!lead) return;
        try {
            await createVisit.mutateAsync({ leadId: lead.id, advisorId: lead.advisorId, checklist });
            toast.success('Visita registrada exitosamente');
            setShowVisitModal(false);
        } catch (error) {
            console.error('[LeadDetail] Error saving visit:', error);
            toast.error('Error al guardar la visita. Por favor intente nuevamente.');
        }
    };
    const handleAddInterest = async () => {
        if (!lead || !selectedPropertyId) return;

        const newInterest: Interest = {
            id: `int-${Date.now()}`,
            leadId: lead.id,
            propertyId: selectedPropertyId,
            date: new Date().toISOString(),
            notes: ''
        };

        try {
            await addInterest.mutateAsync(newInterest);
            toast.success('Interés agregado exitosamente');
            setSelectedPropertyId('');
            setShowInterestModal(false);
            
        } catch (error) {
            console.error('Error adding interest:', error);
            alert('Error al agregar el Interés');
        }
    };

    const getTemperatureColor = (temp: LeadTemperature) => {
        switch (temp) {
            case 'HOT': return 'text-red-600 bg-red-50';
            case 'WARM': return 'text-orange-600 bg-orange-50';
            case 'COLD': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStageLabel = (stage: PipelineStage) => {
        const labels: Record<PipelineStage, string> = {
            NEW: 'Nuevo',
            INFO_SENT: 'Info Enviada',
            CONTACTED: 'Contactado',
            QUALIFIED: 'Calificado',
            PRESENTATION: 'Presentación',
            VISIT: 'Visita',
            NEGOTIATION: 'Negociación',
            CLOSED_WON: 'Cerrado Ganado',
            DISCARDED: 'Descartado'
        };
        return labels[stage] || stage;
    };

    const getInteractionIcon = (type: InteractionType) => {
        switch (type) {
            case 'CALL': return <Phone className="w-4 h-4" />;
            case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />;
            case 'EMAIL': return <Mail className="w-4 h-4" />;
            case 'MEETING': return <Calendar className="w-4 h-4" />;
            case 'VISIT': return <Building2 className="w-4 h-4" />;
            case 'MESSENGER': return <MessageSquare className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando informaci?n del lead...</p>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="p-8">
                <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a Leads
                </button>
                <div className="text-center py-12">
                    <p className="text-gray-600">Lead no encontrado</p>
                </div>
            </div>
        );
    }

    const advisor = advisors.find(a => a.id === lead.advisorId);
    const leadProperties = properties.filter(p => lead.interests?.some(i => i.propertyId === p.id));

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Volver a Leads</span>
                        </button>
                        <div className="flex items-center gap-3">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] transition-colors">
                                    <Edit className="w-4 h-4" />
                                    Editar Lead
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => { setIsEditing(false); setEditForm(lead); }} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </button>
                                    <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        <Save className="w-4 h-4" />
                                        Guardar Cambios
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Main Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-[#BEAF87] to-[#A89770] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {lead.firstName[0]}{lead.lastName[0]}
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <div className="flex gap-2 mb-2">
                                                <input type="text" value={editForm.firstName || ''} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="px-3 py-1 border rounded" placeholder="Nombre" />
                                                <input type="text" value={editForm.lastName || ''} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="px-3 py-1 border rounded" placeholder="Apellido" />
                                            </div>
                                        ) : (
                                            <h1 className="text-2xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h1>
                                        )}
                                        <p className="text-gray-500 text-sm">Lead desde {new Date(lead.createdAt).toLocaleDateString('es-BO')}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {isEditing ? (
                                        <select value={editForm.temperature || 'WARM'} onChange={(e) => setEditForm({ ...editForm, temperature: e.target.value as LeadTemperature })} className="px-3 py-1 border rounded">
                                            <option value="COLD">Frío</option>
                                            <option value="WARM">Tibio</option>
                                            <option value="HOT">Caliente</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getTemperatureColor(lead.temperature)}`}>
                                            <Thermometer className="w-4 h-4" />
                                            {lead.temperature === 'HOT' ? 'Caliente' : lead.temperature === 'WARM' ? 'Tibio' : 'Frío'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    {isEditing ? (
                                        <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="flex-1 px-3 py-1 border rounded" />
                                    ) : (
                                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    {isEditing ? (
                                        <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="flex-1 px-3 py-1 border rounded" />
                                    ) : (
                                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    {isEditing ? (
                                        <input type="text" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="flex-1 px-3 py-1 border rounded" />
                                    ) : (
                                        <span className="text-gray-700">{lead.city}, {lead.country}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    {isEditing ? (
                                        <select value={editForm.advisorId || ''} onChange={(e) => setEditForm({ ...editForm, advisorId: e.target.value })} className="flex-1 px-3 py-1 border rounded">
                                            {advisors.map(adv => (
                                                <option key={adv.id} value={adv.id}>{adv.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-gray-700">{advisor?.name || 'Sin asesor'}</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Etapa del Pipeline</label>
                                {isEditing ? (
                                    <select value={editForm.stage || 'NEW'} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as PipelineStage })} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="NEW">Nuevo</option>
                                        <option value="INFO_SENT">Info Enviada</option>
                                        <option value="CONTACTED">Contactado</option>
                                        <option value="QUALIFIED">Calificado</option>
                                        <option value="PRESENTATION">Presentación</option>
                                        <option value="VISIT">Visita</option>
                                        <option value="NEGOTIATION">Negociación</option>
                                        <option value="CLOSED_WON">Cerrado Ganado</option>
                                        <option value="DISCARDED">Descartado</option>
                                    </select>
                                ) : (
                                    <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">{getStageLabel(lead.stage)}</div>
                                )}
                            </div>
                        </div>

                        {/* Interests Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    Propiedades de Interés
                                </h2>
                                <button onClick={() => setShowInterestModal(true)} className="flex items-center gap-2 px-3 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] text-sm">
                                    <Plus className="w-4 h-4" />
                                    Agregar Interés
                                </button>
                            </div>
                            {leadProperties.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay propiedades de Interés registradÃ­as</p>
                            ) : (
                                <div className="space-y-3">
                                    {leadProperties.map(property => (
                                        <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#BEAF87] transition-colors cursor-pointer" onClick={() => navigate(`/inmuebles`)}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">{property.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>{property.zone}</span>
                                                        <span></span>
                                                        <span className="font-semibold text-[#BEAF87]">{property.currency} {property.price?.toLocaleString() || '0'}</span>
                                                    </div>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions / Interactions Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones</h2>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                        <select 
                                            value={newInteraction.type} 
                                            onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })} 
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent text-sm"
                                        >
                                            <option value="NOTE">Nota</option>
                                            <option value="CALL">Llamada</option>
                                            <option value="WHATSAPP">WhatsApp</option>
                                            <option value="EMAIL">Email</option>
                                            <option value="MEETING">Reunión</option>
                                            <option value="VISIT">Visita</option>
                                            <option value="MESSENGER">Messenger</option>
                                        </select>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                value={newInteraction.content}
                                                onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && newInteraction.content.trim()) {
                                                        handleAddInteraction();
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent text-sm"
                                                placeholder="Escribe la Acción realizada y presiona Enter..."
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddInteraction}
                                        disabled={!newInteraction.content.trim()}
                                        className="w-full px-4 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                                    >
                                        Guardar Acción
                                    </button>
                                </div>
                            </div>

                            {interactions.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay interacciones registradÃ­as</p>
                            ) : (
                                <div className="space-y-4">
                                    {interactions.map((interaction, index) => (
                                        <div key={interaction.id} className="relative">
                                            {index !== interactions.length - 1 && (<div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />)}
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 relative z-10">
                                                    {getInteractionIcon(interaction.type)}
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-lg p-4">
													<div className="flex items-start justify-between mb-2">
														<div>
															<span className="font-semibold text-gray-900">
																{interaction.type === 'CALL' ? 'Llamada' : interaction.type === 'WHATSAPP' ? 'WhatsApp' : interaction.type === 'EMAIL' ? 'Email' : interaction.type === 'MEETING' ? 'Reunión' : interaction.type === 'VISIT' ? 'Visita' : interaction.type === 'NEXT_ACTION' ? 'Próxima Acción' : 'Nota'}
															</span>
															<span className="text-gray-500 text-sm ml-2">
																 {interaction.origin === 'MANUAL' ? 'Manual' : interaction.origin === 'META_ADS' ? 'Meta Ads' : interaction.origin === 'WHATSAPP_API' ? 'WhatsApp API' : interaction.origin}
															</span>
														</div>
														<span className="text-sm text-gray-500">{formatDate(interaction.date)}</span>
													</div>
													<p className="text-gray-700 whitespace-pre-wrap">{interaction.content}</p>
													{interaction.notes && (<p className="text-sm text-gray-500 mt-2 italic">Notas: {interaction.notes}</p>)}
													
													{/* Visit Checklist Details */}
													{interaction.type === 'VISIT' && interaction.visitChecklist && (
														<div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
															<div className="grid grid-cols-2 gap-3 text-sm">
																{interaction.visitChecklist.propertyName && (
																	<div>
																		<span className="font-medium text-gray-700">Propiedad:</span>
																		<p className="text-gray-900">{interaction.visitChecklist.propertyName}</p>
																	</div>
																)}
																{interaction.visitChecklist.clientInterest && (
																	<div>
																		<span className="font-medium text-gray-700">Nivel de Interés:</span>
																		<p className="text-gray-900">
																			{interaction.visitChecklist.clientInterest === 'high' && ' Alto'}
																			{interaction.visitChecklist.clientInterest === 'medium' && ' Medio'}
																			{interaction.visitChecklist.clientInterest === 'low' && '❄️ Bajo'}
																			{interaction.visitChecklist.clientInterest === 'none' && ' Ninguno'}
																		</p>
																	</div>
																)}
															</div>
															
															{interaction.visitChecklist.objections && interaction.visitChecklist.objections.length > 0 && (
																<div>
																	<span className="font-medium text-gray-700 text-sm">Objeciones:</span>
																	<div className="flex flex-wrap gap-1 mt-1">
																		{interaction.visitChecklist.objections.map((obj: string, idx: number) => (
																			<span key={idx} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
																				{obj}
																			</span>
																		))}
																	</div>
																</div>
															)}
															
															{interaction.visitChecklist.positiveReactions && interaction.visitChecklist.positiveReactions.length > 0 && (
																<div>
																	<span className="font-medium text-gray-700 text-sm">Aspectos Positivos:</span>
																	<div className="flex flex-wrap gap-1 mt-1">
																		{interaction.visitChecklist.positiveReactions.map((pos: string, idx: number) => (
																			<span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
																				{pos}
																			</span>
																		))}
																	</div>
																</div>
															)}
															
															{interaction.visitChecklist.nextSteps && (
																<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
																	<span className="font-medium text-amber-900 text-sm">Próximos Pasos:</span>
																	<p className="text-amber-800 text-sm mt-1">{interaction.visitChecklist.nextSteps}</p>
																</div>
															)}
															
															{interaction.visitChecklist.estimatedClosingDate && (
																<div>
																	<span className="font-medium text-gray-700 text-sm">Fecha Estimada de Cierre:</span>
																	<p className="text-gray-900 text-sm">{new Date(interaction.visitChecklist.estimatedClosingDate).toLocaleDateString('es-BO')}</p>
																</div>
															)}
														</div>
													)}
												</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                         {/* Next Actions Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Pr?ximas Acciones a Realizar</h2>
                            
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.nextActionDate?.slice(0, 16) || ''}
                                            onChange={(e) => setEditForm({ ...editForm, nextActionDate: new Date(e.target.value).toISOString() })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">descripción</label>
                                    <textarea
                                        value={editForm.nextAction || ''}
                                        onChange={(e) => setEditForm({ ...editForm, nextAction: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent"
                                        rows={3}
                                        placeholder="Describe la Próxima Acción a realizar..."
                                    />
                                </div>
                                <button
                                    onClick={handleSaveEdit}
                                    className="mt-4 w-full px-4 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] font-semibold transition-all"
                                >
                                    Guardar Próxima Acción
                                </button>
                                
                                {lead.nextAction && !isEditing && (
                                    <div className="mt-4 bg-white border border-yellow-300 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-semibold">{lead.nextActionDate && formatDate(lead.nextActionDate)}</span>
                                        </div>
                                        <p className="text-gray-700">{lead.nextAction}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
                            <div className="space-y-3">
                                <a href={`tel:${lead.phone}`} className="flex items-center gap-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                    <Phone className="w-5 h-5" />
                                    <span className="font-medium">Llamar</span>
                                </a>
                                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-medium">WhatsApp</span>
                                </a>
                                <a href={`mailto:${lead.email}`} className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Mail className="w-5 h-5" />
                                    <span className="font-medium">Enviar Email</span>
                                </a>
                                <button onClick={() => setShowVisitModal(true)} className="flex items-center gap-3 w-full px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium">Registrar Visita</span>
                                </button>
                                <button onClick={() => setShowInteractionModal(true)} className="flex items-center gap-3 w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">Agendar Reunión</span>
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Fuente del Lead</h4>
                                <p className="text-gray-900 font-medium">{lead.source}</p>
                                {lead.sourceDetail && (<p className="text-sm text-gray-500 mt-1">{lead.sourceDetail}</p>)}
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Última Actualización</h4>
                                <p className="text-sm text-gray-600">{formatDate(lead.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showInteractionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">NuevÃ­a Interacción</h3>
                                <button onClick={() => setShowInteractionModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Interacción</label>
                                <select value={newInteraction.type} onChange={(e) => setNewInteraction({ ...newInteraction, type: e.target.value as InteractionType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent">
                                    <option value="NOTE">Nota</option>
                                    <option value="CALL">Llamada</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="EMAIL">Email</option>
                                    <option value="MEETING">Reunión</option>
                                    <option value="VISIT">Visita</option>
                                    <option value="MESSENGER">Messenger</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
                                <textarea value={newInteraction.content} onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent" rows={4} placeholder="Describe la Interacción..." required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
                                <textarea value={newInteraction.notes} onChange={(e) => setNewInteraction({ ...newInteraction, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent" rows={2} placeholder="Notas opcionales..." />
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowInteractionModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
                            <button onClick={handleAddInteraction} disabled={!newInteraction.content.trim()} className="px-4 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] disabled:opacity-50 disabled:cursor-not-allowed">Agregar Interacción</button>
                        </div>
                    </div>
                </div>
            )}

            {showInterestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Agregar Propiedad de Interés</h3>
                                <button onClick={() => setShowInterestModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Propiedad</label>
                            <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BEAF87] focus:border-transparent">
                                <option value="">-- Seleccionar --</option>
                                {properties.filter(p => !lead.interests?.some(i => i.propertyId === p.id)).map(property => {
                                    const propertyUnits = units.filter(u => u.propertyId === property.id);
                                    if (property.isProject && propertyUnits.length > 0) {
                                        return (
                                            <optgroup key={property.id} label={${property.name} - }>
                                                {propertyUnits.map(unit => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.name} - {unit.area}m - {unit.currency} {unit.price?.toLocaleString() || '0'}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    } else {
                                        return (
                                            <option key={property.id} value={property.id}>
                                                {property.name} - {property.zone} ({property.currency} {property.price?.toLocaleString() || '0'})
                                            </option>
                                        );
                                    }
                                })}
                            </select>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowInterestModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
                            <button onClick={handleAddInterest} disabled={!selectedPropertyId} className="px-4 py-2 bg-[#BEAF87] text-white rounded-lg hover:bg-[#A89770] disabled:opacity-50 disabled:cursor-not-allowed">Agregar Interés</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Visit Checklist Modal */}
            <VisitChecklistModal
                isOpen={showVisitModal}
                onClose={() => setShowVisitModal(false)}
                onSave={handleSaveVisit}
                leadId={lead.id}
                leadName={`${lead.firstName} ${lead.lastName}`}
                properties={properties}
            />
        </div>
    );
};

export default LeadDetail;









