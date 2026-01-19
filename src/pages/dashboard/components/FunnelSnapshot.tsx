import React from 'react';
import { Filter } from 'lucide-react';

interface FunnelSnapshotProps {
    counts: Record<string, number>;
    onFilter: (stage: string) => void;
}

const FunnelSnapshot: React.FC<FunnelSnapshotProps> = ({ counts, onFilter }) => {

    const stages = [
        { key: 'RECIBIDOS', label: 'Recibidos', color: '#104e8b', width: '100%' },      // Dark Blue
        { key: 'INFO_ENVIADA', label: 'Info Enviada', color: '#1874cd', width: '85%' },  // Medium Blue
        { key: 'CONTACTADOS', label: 'Contactados', color: '#1c86ee', width: '70%' },    // Light Blue
        { key: 'EN_SEGUIMIENTO', label: 'En Seguimiento', color: '#4da6ff', width: '55%' }, // Very Light Blue
        { key: 'VISITAS', label: 'Visitas', color: '#f39c12', width: '40%' },            // Orange
        { key: 'CERRADOS', label: 'Cerrados', color: '#dd4b39', width: '25%' },          // Red
    ];

    return (
        <div className="card bg-white shadow-sm h-full">
            <div className="card-header p-4 border-b border-[var(--border-light)] flex justify-between items-center">
                <h3 className="font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
                    <span className="text-orange-500">??</span> Embudo de Ventas
                </h3>
                {/* <Filter size={16} className="text-[var(--text-muted)] cursor-pointer" /> */}
            </div>
            <div className="p-6 flex flex-col items-center justify-center gap-1">
                {stages.map((stage) => {
                    // Fallback to 0 if count doesn't exist
                    const count = counts[stage.key] ?? 0;
                    
                    return (
                        <div
                            key={stage.key}
                            onClick={() => onFilter(stage.key === 'EN_SEGUIMIENTO' ? 'QUALIFIED' : stage.key)} // simple mapping for now
                            className="w-full flex items-center group cursor-pointer"
                        >
                            {/* Funnel Bar Container - Centered */}
                            <div className="flex-1 flex justify-center">
                                <div
                                    className="h-10 flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-transform group-hover:scale-105 relative"
                                    style={{
                                        width: stage.width,
                                        backgroundColor: stage.color,
                                        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)', // Trapezoid
                                        marginBottom: '2px'
                                    }}
                                >
                                    <span className="drop-shadow-md z-10">{stage.label}</span>
                                </div>
                            </div>

                            {/* Count Label - Right aligned with line effect */}
                            <div className="w-16 flex items-center relative pl-2">
                                <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gray-100 -z-10"></div>
                                <span className="font-bold text-xl text-gray-700 bg-white pl-2">{count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FunnelSnapshot;
