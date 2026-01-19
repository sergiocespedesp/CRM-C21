import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, User, Building2, Calendar, GripVertical } from 'lucide-react';
import type { Lead, Advisor, Property } from '../types';

interface KanbanCardProps {
    lead: Lead;
    advisor?: Advisor;
    property?: Property;
    onClick?: () => void;
    isOverlay?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, advisor, property, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getTemperatureColor = (temp: string) => {
        switch (temp) {
            case 'HOT': return 'bg-red-100 text-red-700 border-red-200';
            case 'WARM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'COLD': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md transition-all touch-none ${
                isDragging ? 'shadow-lg ring-2 ring-black/10' : ''
            }`}
            onClick={onClick}
        >
            <div className="flex items-start gap-2">
                <div className="text-gray-300 mt-1">
                    <GripVertical size={16} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {lead.firstName} {lead.lastName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTemperatureColor(lead.temperature)}`}>
                            {lead.temperature}
                        </span>
                    </div>

                    <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                        </div>
                    </div>

                    {advisor && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                            <User size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{advisor.name}</span>
                        </div>
                    )}

                    {property && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{property.name}</span>
                        </div>
                    )}

                    {lead.nextAction && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-start gap-1.5 text-xs">
                                <Calendar size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-700 font-medium truncate">{lead.nextAction}</p>
                                    {lead.nextActionDate && (
                                        <p className="text-orange-600 text-xs">
                                            {new Date(lead.nextActionDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanCard;