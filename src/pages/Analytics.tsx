import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, RefreshCw, Download, Award, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useAdvisors } from '../hooks/useAdvisors';
import type { PipelineStage, LeadTemperature } from '../types';

const Analytics = () => {
    // React Query Hooks
    const { data: leads = [], isLoading: isLoadingLeads } = useLeads();
    const { data: advisors = [], isLoading: isLoadingAdvisors } = useAdvisors();

    // Calculations
    const getSummary = () => {
        const totalLeads = leads.length;
        const activeLeads = leads.filter(l => l.stage !== 'CLOSED_WON' && l.stage !== 'DISCARDED').length;
        const convertedLeads = leads.filter(l => l.stage === 'CLOSED_WON').length;
        const overallConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

        const closedWonLeads = leads.filter(l => l.stage === 'CLOSED_WON');
        let totalDays = 0;
        closedWonLeads.forEach(lead => {
            const created = new Date(lead.createdAt);
            const now = new Date(); // Or close date if available
            const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            totalDays += days;
        });
        const averageTimeToClose = closedWonLeads.length > 0 ? totalDays / closedWonLeads.length : 0;

        return { totalLeads, activeLeads, convertedLeads, overallConversionRate, averageTimeToClose };
    };

    const getMonthlyTrends = (months: number = 6) => {
        const trends = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthLeads = leads.filter(l => {
                const createdDate = new Date(l.createdAt);
                return createdDate >= monthStart && createdDate <= monthEnd;
            });

            const convertedLeads = monthLeads.filter(l => l.stage === 'CLOSED_WON').length;
            const revenue = convertedLeads * 50000; // Mock revenue

            trends.push({
                month: monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                newLeads: monthLeads.length,
                convertedLeads,
                revenue
            });
        }
        return trends;
    };

    const getLeadSourceAnalysis = () => {
        const sourceCounts: { [key: string]: number } = {};
        leads.forEach(lead => {
            const source = lead.source || 'Desconocido';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        return Object.entries(sourceCounts)
            .map(([source, count]) => ({
                source,
                count,
                percentage: leads.length > 0 ? (count / leads.length) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count);
    };

    const getTemperatureDistribution = () => {
        const temperatures: LeadTemperature[] = ['NONE', 'COLD', 'WARM', 'HOT'];
        return temperatures.map(temp => {
            const count = leads.filter(l => l.temperature === temp).length;
            return {
                temperature: temp,
                count,
                percentage: leads.length > 0 ? (count / leads.length) * 100 : 0
            };
        });
    };

    const getAdvisorPerformance = () => {
        return advisors.map(advisor => {
            const advisorLeads = leads.filter(l => l.advisorId === advisor.id);
            const convertedLeads = advisorLeads.filter(l => l.stage === 'CLOSED_WON').length;
            const conversionRate = advisorLeads.length > 0 ? (convertedLeads / advisorLeads.length) * 100 : 0;
            return {
                advisor,
                convertedLeads,
                conversionRate,
                totalLeads: advisorLeads.length
            };
        }).sort((a, b) => b.conversionRate - a.conversionRate);
    };

    // Memoize if needed, but for now calculate on render for simplicity
    const summary = getSummary();
    const monthlyTrends = getMonthlyTrends();
    const sourceData = getLeadSourceAnalysis();
    const tempData = getTemperatureDistribution();
    const advisorPerformance = getAdvisorPerformance();

    if (isLoadingLeads || isLoadingAdvisors) {
        return (
             <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87]"></div>
             </div>
        );
    }

    const getTempLabel = (temp: string) => ({ 'NONE': 'Sin Temp.', 'COLD': 'Frío', 'WARM': 'Tibio', 'HOT': 'Caliente' }[temp] || temp);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analíticas</h1>
                    <p className="text-gray-500 mt-1">Métricas clave de rendimiento y conversión</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm">
                    <Download size={18} />
                    Exportar Reporte
                </button>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <TrendingUp size={12} className="mr-1" /> +12%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Leads</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.totalLeads}</h3>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <RefreshCw size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                             <TrendingUp size={12} className="mr-1" /> +5.2%
                        </span>
                    </div>
                     <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tasa de Conversión</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.overallConversionRate.toFixed(1)}%</h3>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                         <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                             <TrendingUp size={12} className="mr-1" /> -2d
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tiempo Promedio Cierre</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.averageTimeToClose.toFixed(0)} días</h3>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <BarChart3 size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                             <TrendingUp size={12} className="mr-1" /> +8%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Leads Activos</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary.activeLeads}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Lead Sources */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-[#BEAF87]" />
                        Origen de Leads
                    </h3>
                    <div className="space-y-4">
                        {sourceData.map((data, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-gray-700">{data.source}</span>
                                    <span className="text-gray-900">{data.count} ({data.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-[#BEAF87] transition-all duration-500"
                                        style={{ width: `${data.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Temperature Distribution */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                         <TrendingUp size={20} className="text-[#BEAF87]" />
                        Temperatura de Leads
                    </h3>
                    <div className="space-y-6">
                         {tempData.map((data, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${data.temperature === 'HOT' ? 'bg-red-500' : data.temperature === 'WARM' ? 'bg-yellow-500' : data.temperature === 'COLD' ? 'bg-blue-400' : 'bg-gray-200'}`} />
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                         <span className="text-gray-700">{getTempLabel(data.temperature)}</span>
                                         <span className="text-gray-900">{data.count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${data.temperature === 'HOT' ? 'bg-red-500' : data.temperature === 'WARM' ? 'bg-yellow-500' : data.temperature === 'COLD' ? 'bg-blue-400' : 'bg-gray-200'} opacity-80`}
                                            style={{ width: `${data.percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-500 w-12 text-right">{data.percentage.toFixed(0)}%</span>
                            </div>
                         ))}
                    </div>
                </div>
            </div>

             {/* Advisor Performance */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Award size={20} className="text-[#BEAF87]" />
                        Rendimiento por Asesor
                    </h3>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                             <tr>
                                 <th className="px-6 py-4">Asesor</th>
                                 <th className="px-6 py-4 text-center">Total Leads</th>
                                 <th className="px-6 py-4 text-center">Convertidos</th>
                                 <th className="px-6 py-4 text-right">Tasa de Conversión</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {advisorPerformance.map((item, index) => (
                                 <tr key={index} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-4 font-medium text-gray-900">
                                         {item.advisor.name}
                                     </td>
                                     <td className="px-6 py-4 text-center text-gray-600">
                                         {item.totalLeads}
                                     </td>
                                     <td className="px-6 py-4 text-center text-gray-600">
                                         {item.convertedLeads}
                                     </td>
                                     <td className="px-6 py-4 text-right font-bold text-gray-900">
                                         {item.conversionRate.toFixed(1)}%
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

export default Analytics;
