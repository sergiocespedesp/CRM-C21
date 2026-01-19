import confetti from 'canvas-confetti';
import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLeads, useUpdateLead } from '../hooks/useLeads';
import { useAdvisors } from '../hooks/useAdvisors';
import { useProperties } from '../hooks/useProperties';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import type { Lead, PipelineStage } from '../types';
import { Filter, X } from 'lucide-react';

const COLUMNS: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'NEW', label: 'Nuevo', color: 'blue' },
    { id: 'INFO_SENT', label: 'Info Enviada', color: 'indigo' },
    { id: 'CONTACTED', label: 'Contactado', color: 'yellow' },
    { id: 'QUALIFIED', label: 'Calificado', color: 'purple' },
    { id: 'PRESENTATION', label: 'Presentación', color: 'cyan' },
    { id: 'VISIT', label: 'Visita', color: 'pink' },
    { id: 'NEGOTIATION', label: 'Negociación', color: 'orange' },
    { id: 'CLOSED_WON', label: 'Cerrado Ganado', color: 'green' },
    { id: 'DISCARDED', label: 'Descartado', color: 'gray' }
];

const KanbanView = () => {
    // React Query hooks
    const { data: leads = [], isLoading } = useLeads();
    const updateLead = useUpdateLead();
    const { data: advisors = [] } = useAdvisors();
    const { data: properties = [] } = useProperties();

    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the lead being dragged
        const lead = leads.find(l => l.id === activeId);
        if (!lead) return;

        // Find the target column
        let newStage: PipelineStage | null = null;

        // Check if dropped directly on a column
        if (COLUMNS.some(col => col.id === overId)) {
            newStage = overId as PipelineStage;
        } else {
            // Check if dropped on another card
            const overLead = leads.find(l => l.id === overId);
            if (overLead) {
                newStage = overLead.stage;
            }
        }

        if (newStage && newStage !== lead.stage) {
            // Optimistic update handled by React Query + local state would be ideal, 
            // but for now, we rely on mutation + invalidation
            
            // Trigger celebration if Won
            if (newStage === 'CLOSED_WON') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            try {
                await updateLead.mutateAsync({
                    id: lead.id,
                    data: { stage: newStage }
                });
            } catch (error) {
                console.error('Error updating lead stage:', error);
                // Ideally show toast error
            }
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Filter leads
    const filteredLeads = leads.filter(lead => 
        searchTerm === '' || 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group leads by stage
    const getLeadsByStage = (stage: PipelineStage) => {
        return filteredLeads.filter(lead => lead.stage === stage);
    };

    const clearFilters = () => {
        setSearchTerm('');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87]"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Embudo de Ventas</h1>
                    <p className="text-gray-500 mt-1">Visualiza y gestiona el progreso de tus leads</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <Filter className="text-gray-400 w-5 h-5 ml-2" />
                    <input 
                        type="text" 
                        placeholder="Filtrar leads..." 
                        className="bg-transparent border-none outline-none text-sm w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={clearFilters} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 min-w-max h-full">
                        {COLUMNS.map(column => (
                            <KanbanColumn 
                                key={column.id}
                                id={column.id}
                                label={column.label}
                                color={column.color}
                                leads={getLeadsByStage(column.id)}
                                stage={column.id}
                                advisors={advisors || []}
                                properties={properties || []}
                                onLeadClick={(lead) => window.location.href = `/leads/${lead.id}`}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <KanbanCard 
                            lead={leads.find(l => l.id === activeId)!} 
                            isOverlay 
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanView;
