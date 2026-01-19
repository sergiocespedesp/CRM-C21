import React from 'react';
import { Activity, Clock, Phone, MessageSquare, Calendar, Users } from 'lucide-react';
import type { Interaction, Lead } from '../../../types';

interface ActivityFeedProps {
    interactions: Interaction[];
    leads: Lead[];
    onNavigate: (path: string) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ interactions, leads, onNavigate }) => {

    const getLeadName = (leadId: string): string => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            return `${lead.firstName} ${lead.lastName}`;
        }
        return `Lead #${leadId.slice(0, 4)}...`;
    };

    return (
        <div className="card bg-white shadow-sm">
            <div className="card-header p-4 border-b border-[var(--border-light)]">
                <h3 className="font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
                    <Activity size={18} className="text-[var(--text-muted)]" /> Actividad Reciente
                </h3>
            </div>
            <div className="card-body p-0 max-h-[400px] overflow-y-auto">
                {interactions.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)] text-sm">No hay actividad reciente</div>
                ) : (
                    <div className="divide-y divide-[var(--border-light)]">
                        {interactions.slice(0, 10).map((interaction, index) => (
                            <div key={index} className="p-4 flex gap-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${interaction.type === 'CALL' ? 'bg-blue-500' :
                                        interaction.type === 'WHATSAPP' ? 'bg-green-500' : 'bg-purple-500'
                                    }`}>
                                    {interaction.type === 'CALL' ? <Phone size={14} /> :
                                        interaction.type === 'WHATSAPP' ? <MessageSquare size={14} /> :
                                            interaction.type === 'VISIT' ? <Users size={14} /> : <Calendar size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-[var(--color-secondary)] hover:underline cursor-pointer truncate" onClick={() => onNavigate(`/leads`)}>
                                            {getLeadName(interaction.leadId)}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 whitespace-nowrap">
                                            <Clock size={10} />
                                            {new Date(interaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--text-main)] line-clamp-2">{interaction.content}</p>
                                    <div className="mt-1 text-xs text-gray-400 capitalize">{interaction.type.toLowerCase()} • {interaction.origin.toLowerCase()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
