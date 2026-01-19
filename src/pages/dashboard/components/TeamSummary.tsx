
import React from 'react';
import { Users, TrendingUp } from 'lucide-react';

// Mock component for now as we don't have full team structure yet
const TeamSummary: React.FC = () => {
    return (
        <div className="card bg-white shadow-sm mt-6 border-t-4 border-t-gray-600">
            <div className="card-header p-4 border-b border-[var(--border-light)] flex justify-between items-center">
                <h3 className="font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
                    <Users size={18} className="text-[var(--text-muted)]" /> Resumen de Equipo (Admin)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-3">Asesor</th>
                            <th className="p-3 text-center">Leads Nuevos</th>
                            <th className="p-3 text-center">Atrasados</th>
                            <th className="p-3 text-center">En Proceso</th>
                            <th className="p-3 text-center">Cerrados (Mes)</th>
                            <th className="p-3 text-right">Rendimiento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="p-3 font-medium">Carlos Gómez (Tel)</td>
                            <td className="p-3 text-center font-bold text-blue-600">12</td>
                            <td className="p-3 text-center text-red-500">4</td>
                            <td className="p-3 text-center">15</td>
                            <td className="p-3 text-center text-green-600">2</td>
                            <td className="p-3 text-right"><TrendingUp size={16} className="ml-auto text-green-500" /></td>
                        </tr>
                        {/* Mock Other Agents */}
                        <tr className="opacity-60 bg-gray-50/50">
                            <td className="p-3">Ana Pérez</td>
                            <td className="p-3 text-center">8</td>
                            <td className="p-3 text-center">1</td>
                            <td className="p-3 text-center">22</td>
                            <td className="p-3 text-center">5</td>
                            <td className="p-3 text-right"><TrendingUp size={16} className="ml-auto text-green-500" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamSummary;
