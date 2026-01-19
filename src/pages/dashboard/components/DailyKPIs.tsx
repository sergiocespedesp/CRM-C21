import React from 'react';
import { Users, CheckSquare, AlertCircle, Flame, ArrowRight, Building } from 'lucide-react';
import type { DashboardData } from '../hooks/useDashboardData';

interface DailyKPIsProps {
    data: DashboardData;
    onNavigate: (path: string) => void;
}

const DailyKPIs: React.FC<DailyKPIsProps> = ({ data, onNavigate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">

            {/* 1. Leads Nuevos Hoy */}
            <div className="card bg-white p-4 border-l-4 border-l-[var(--color-info)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase">Leads Nuevos</h3>
                        <p className="text-3xl font-bold text-[var(--color-info)] mt-1">{data.newLeadsToday}</p>
                    </div>
                    <div className="bg-[var(--color-info)]/10 p-2 rounded-lg">
                        <Users size={20} className="text-[var(--color-info)]" />
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('/leads?filter=NEW')}
                    className="w-full mt-2 text-xs font-medium text-[var(--color-info)] flex items-center justify-between hover:bg-[var(--color-info)]/5 p-1 rounded transition-colors"
                >
                    Ver Detalles <ArrowRight size={12} />
                </button>
            </div>

            {/* 2. Tareas Hoy */}
            <div className="card bg-white p-4 border-l-4 border-l-[var(--color-primary)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase">Tareas Hoy</h3>
                        <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">{data.tasksToday}</p>
                    </div>
                    <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg">
                        <CheckSquare size={20} className="text-[var(--color-primary)]" />
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('/dashboard?view=tasks')}
                    className="w-full mt-2 text-xs font-medium text-[var(--color-primary)] flex items-center justify-between hover:bg-[var(--color-primary)]/5 p-1 rounded transition-colors"
                >
                    Ver Tareas <ArrowRight size={12} />
                </button>
            </div>

            {/* 3. Proyectos Activos (NEW) */}
            <div className="card bg-white p-4 border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase">Proyectos</h3>
                        <p className="text-3xl font-bold text-indigo-500 mt-1">{data.activeProjects}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg">
                        <Building size={20} className="text-indigo-500" />
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('/inmuebles')}
                    className="w-full mt-2 text-xs font-medium text-indigo-500 flex items-center justify-between hover:bg-indigo-50 p-1 rounded transition-colors"
                >
                    Ver Inventario <ArrowRight size={12} />
                </button>
            </div>

            {/* 4. Acciones Atrasadas */}
            <div className="card bg-white p-4 border-l-4 border-l-[var(--color-danger)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase">Acciones Atrasadas</h3>
                        <p className="text-3xl font-bold text-[var(--color-danger)] mt-1">{data.overdueTasks}</p>
                    </div>
                    <div className="bg-[var(--color-danger)]/10 p-2 rounded-lg">
                        <AlertCircle size={20} className="text-[var(--color-danger)]" />
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('/dashboard?view=overdue')}
                    className="w-full mt-2 text-xs font-medium text-[var(--color-danger)] flex items-center justify-between hover:bg-[var(--color-danger)]/5 p-1 rounded transition-colors"
                >
                    Ver Pendientes <ArrowRight size={12} />
                </button>
            </div>

            {/* 5. Leads Calientes */}
            <div className="card bg-white p-4 border-l-4 border-l-[var(--color-warning)] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase">Leads Calientes</h3>
                        <p className="text-3xl font-bold text-[var(--color-warning)] mt-1">{data.hotLeadsActive}</p>
                    </div>
                    <div className="bg-[var(--color-warning)]/10 p-2 rounded-lg">
                        <Flame size={20} className="text-[var(--color-warning)]" />
                    </div>
                </div>
                <button
                    onClick={() => onNavigate('/leads?temperature=HOT')}
                    className="w-full mt-2 text-xs font-medium text-[var(--color-warning)] flex items-center justify-between hover:bg-[var(--color-warning)]/5 p-1 rounded transition-colors"
                >
                    Ver Prioridad <ArrowRight size={12} />
                </button>
            </div>

        </div>
    );
};

export default DailyKPIs;
