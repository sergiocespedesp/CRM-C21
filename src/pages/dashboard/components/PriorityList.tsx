import React from 'react';
import { AlertCircle, Calendar, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import type { PriorityItem } from '../hooks/useDashboardData';

interface PriorityListProps {
    items: PriorityItem[];
    onNavigate: (id: string) => void;
}

const PriorityList: React.FC<PriorityListProps> = ({ items, onNavigate }) => {

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'WHATSAPP': return <MessageCircle size={14} className="text-green-500" />;
            case 'CALL': return <Phone size={14} className="text-blue-500" />;
            case 'EMAIL': return <Mail size={14} className="text-gray-500" />;
            default: return <Clock size={14} className="text-gray-400" />;
        }
    };

    return (
        <div className="card bg-white shadow-sm h-full flex flex-col">
            <div className="card-header p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-orange-50/50">
                <h3 className="font-semibold text-lg text-[var(--color-warning)] flex items-center gap-2">
                    <FlameIcon /> Prioridad Alta (Hoy)
                </h3>
                <span className="text-xs font-bold text-[var(--color-warning)] bg-orange-100 px-2 py-1 rounded-full">
                    {items.length} Pendientes
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Canal</th>
                            <th className="p-3 text-right">Acci�n</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-[var(--text-muted)] italic">
                                    �Genial! No tienes leads urgentes pendientes.
                                </td>
                            </tr>
                        ) : (
                            items.slice(0, 10).map((item) => (
                                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                                    <td className="p-3">
                                        <div className="font-medium text-[var(--text-main)]">{item.name}</div>
                                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                            <Calendar size={10} /> {item.nextActionDate ? new Date(item.nextActionDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-xs">{item.stage.replace('_', ' ')}</span>
                                            {item.type === 'HOT' && (
                                                <span className="flex items-center gap-1 text-[var(--color-danger)] text-[10px] font-bold">
                                                    <AlertCircle size={10} /> CALIENTE
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center">{getChannelIcon(item.channel)}</div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => onNavigate(item.id)}
                                            className="text-[var(--color-secondary)] hover:underline font-medium text-xs border border-[var(--color-secondary)] px-2 py-1 rounded hover:bg-[var(--color-secondary)] hover:text-white transition-all"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {items.length > 10 && (
                <div className="p-2 text-center border-t border-[var(--border-light)]">
                    <button className="text-xs text-[var(--text-muted)] hover:text-[var(--color-secondary)]">
                        Ver {items.length - 10} m�s...
                    </button>
                </div>
            )}
        </div>
    );
};

const FlameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f39c12" stroke="#d35400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.243-2.143.5-3.143.624 1.624 3 2.624 3 3.643z" /></svg>
);

export default PriorityList;
