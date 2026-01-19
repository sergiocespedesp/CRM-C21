import React from 'react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Lead, Advisor, Property, PipelineStage } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    stage: PipelineStage;
    label: string;
    color: string;
    leads: Lead[];
    advisors: Advisor[];
    properties: Property[];
    onLeadClick: (lead: Lead) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    stage,
    label,
    color,
    leads,
    advisors,
    properties,
    onLeadClick
}) => {
        const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });
    const { over } = useDndContext();
    const isOverItem = leads.some(lead => lead.id === over?.id);
    const isActive = isOver || isOverItem;

    const getColorClasses = (colorName: string) => {
        const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
            cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100' },
            yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
            indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100' },
            pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
            green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
            gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100' },
        };
        return colors[colorName] || colors.gray;
    };

    const colorClasses = getColorClasses(color);

    return (
        <div 
            ref={setNodeRef}
            className={`flex flex-col h-full min-w-[280px] max-w-[320px] rounded-lg transition-colors ${isActive ? 'ring-2 ring-black/10 bg-gray-100' : ''}`}
        >
            {/* Column Header */}
            <div className={`${colorClasses.bg} ${colorClasses.border} border-b-2 rounded-t-lg p-3 flex items-center justify-between`}>
                <h3 className={`font-semibold text-sm ${colorClasses.text}`}>
                    {label}
                </h3>
                <span className={`${colorClasses.badge} ${colorClasses.text} px-2 py-0.5 rounded-full text-xs font-medium`}>
                    {leads.length}
                </span>
            </div>

            {/* Drop Area Content */}
            <div
                className="flex-1 bg-gray-50/50 rounded-b-lg p-2 overflow-y-auto"
                style={{ minHeight: '400px', maxHeight: 'calc(100vh - 250px)' }}
            >
                <SortableContext
                    items={leads.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {leads.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic min-h-[100px]">
                            Arrastra leads aquí
                        </div>
                    ) : (
                        leads.map(lead => {
                            const advisor = advisors.find(a => a.id === lead.advisorId);
                            let property: Property | undefined;
                            
                            if (lead.interests && lead.interests.length > 0) {
                                const lastInterest = lead.interests[lead.interests.length - 1];
                                property = properties.find(p => p.id === lastInterest.propertyId);
                            }

                            return (
                                <KanbanCard
                                    key={lead.id}
                                    lead={lead}
                                    advisor={advisor}
                                    property={property}
                                    onClick={() => onLeadClick(lead)}
                                />
                            );
                        })
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default KanbanColumn;