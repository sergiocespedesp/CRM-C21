
import React from 'react';
import { Target, Facebook, MessageCircle, Phone, Globe } from 'lucide-react';

interface DailyInputsProps {
    leadsBySource: Record<string, number>;
    progress: number;
}

const DailyInputs: React.FC<DailyInputsProps> = ({ leadsBySource, progress }) => {

    const getSourceIcon = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('facebook') || s.includes('instagram')) return <Facebook size={14} />;
        if (s.includes('whatsapp')) return <MessageCircle size={14} />;
        if (s.includes('call') || s.includes('telefono')) return <Phone size={14} />;
        return <Globe size={14} />;
    };

    return (
        <div className="card bg-white shadow-sm h-full">
            <div className="card-header p-4 border-b border-[var(--border-light)]">
                <h3 className="font-semibold text-lg text-[var(--text-main)]">Entradas de Hoy</h3>
            </div>
            <div className="p-4 flex flex-col gap-4">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-[var(--text-muted)]">Atención de Leads Nuevos</span>
                        <span className="font-bold text-[var(--color-primary)]">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-[var(--color-primary)] h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Sources List */}
                <div className="flex-1 overflow-y-auto">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase mb-2">Por Fuente</h4>
                    {Object.keys(leadsBySource).length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No hay ingresos hoy.</p>
                    ) : (
                        <div className="space-y-2">
                            {Object.entries(leadsBySource).map(([source, count]) => (
                                <div key={source} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
                                    <div className="flex items-center gap-2 text-[var(--text-main)]">
                                        {getSourceIcon(source)}
                                        <span className="capitalize">{source.toLowerCase()}</span>
                                    </div>
                                    <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyInputs;
