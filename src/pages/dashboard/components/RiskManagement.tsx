
import React from 'react';
import { AlertTriangle, Clock, ThermometerSnowflake, ChevronRight, Ban } from 'lucide-react';
import type { Lead } from '../../../types';

interface RiskManagementProps {
    hotLeadsNoAction: Lead[];
    infoSentNoFollowup: Lead[];
    coolingDownLeads: Lead[];
    onNavigate: (path: string) => void;
}

const RiskManagement: React.FC<RiskManagementProps> = ({
    hotLeadsNoAction,
    infoSentNoFollowup,
    coolingDownLeads,
    onNavigate
}) => {
    return (
        <div className="card bg-white shadow-sm h-full">
            <div className="card-header p-4 border-b border-[var(--border-light)] bg-red-50/50">
                <h3 className="font-semibold text-lg text-[var(--color-danger)] flex items-center gap-2">
                    <AlertTriangle size={18} /> Alertas y Riesgos
                </h3>
            </div>
            <div className="divide-y divide-[var(--border-light)]">

                {/* 1. Hot No Action */}
                <div className="p-4 hover:bg-red-50 transition-colors cursor-pointer group" onClick={() => onNavigate('/leads?risk=hot-no-action')}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-medium text-[var(--text-main)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]"></span>
                            {hotLeadsNoAction.length} Calientes sin acción
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--color-danger)]" />
                    </div>
                    {hotLeadsNoAction.length > 0 && (
                        <p className="text-xs text-[var(--text-muted)] pl-4">
                            Ej: {hotLeadsNoAction[0].firstName} {hotLeadsNoAction[0].lastName}...
                        </p>
                    )}
                </div>

                {/* 2. Info Sent No Followup */}
                <div className="p-4 hover:bg-orange-50 transition-colors cursor-pointer group" onClick={() => onNavigate('/leads?risk=info-sent')}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-medium text-[var(--text-main)]">
                            <Clock size={14} className="text-[var(--color-warning)]" />
                            {infoSentNoFollowup.length} Sin seguimiento tras info
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-[var(--color-warning)]" />
                    </div>
                </div>

                {/* 3. Cooling Down */}
                <div className="p-4 hover:bg-blue-50 transition-colors cursor-pointer group" onClick={() => onNavigate('/leads?risk=inactive')}>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-medium text-[var(--text-main)]">
                            <ThermometerSnowflake size={14} className="text-blue-400" />
                            {coolingDownLeads.length} Leads inactivos (+7 días)
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-400" />
                    </div>
                </div>

                {/* 4. Empty State Fallback (Visual filler) */}
                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 font-medium text-[var(--text-main)]">
                            <Ban size={14} className="text-gray-400" />
                            0 Leads Perdidos (Limbo)
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RiskManagement;
