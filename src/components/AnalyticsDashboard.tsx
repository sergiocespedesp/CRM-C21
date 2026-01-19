import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Award } from 'lucide-react';

interface AnalyticsMetric {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down';
    icon: React.ReactNode;
    color: string;
}

interface ConversionData {
    stage: string;
    count: number;
    percentage: number;
}

interface AnalyticsDashboardProps {
    metrics: AnalyticsMetric[];
    conversionFunnel: ConversionData[];
    topAdvisors: { name: string; conversions: number; revenue: number }[];
    sourceBreakdown: { source: string; count: number; percentage: number }[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
    metrics,
    conversionFunnel,
    topAdvisors,
    sourceBreakdown
}) => {
    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                    <div key={idx} className="card">
                        <div className="card-body">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        {metric.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {metric.value}
                                    </p>
                                    {metric.change !== undefined && (
                                        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {metric.trend === 'up' ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            <span>{Math.abs(metric.change)}%</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`p-3 rounded-lg ${metric.color}`}>
                                    {metric.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-bold text-lg">Embudo de Conversión</h3>
                    </div>
                    <div className="card-body">
                        <div className="space-y-3">
                            {conversionFunnel.map((stage, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                                        <span className="text-sm font-bold text-gray-900">{stage.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-gradient-to-r from-[#BEAF87] to-[#A89770] h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${stage.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{stage.percentage.toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Advisors */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-bold text-lg">Top Asesores</h3>
                    </div>
                    <div className="card-body">
                        <div className="space-y-3">
                            {topAdvisors.map((advisor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#BEAF87] flex items-center justify-center text-white font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{advisor.name}</p>
                                            <p className="text-xs text-gray-500">{advisor.conversions} conversiones</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">${advisor.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Source Breakdown */}
                <div className="card lg:col-span-2">
                    <div className="card-header">
                        <h3 className="font-bold text-lg">Fuentes de Leads</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {sourceBreakdown.map((source, idx) => (
                                <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600 mb-2">{source.source}</p>
                                    <p className="text-3xl font-bold text-gray-900">{source.count}</p>
                                    <p className="text-xs text-gray-500 mt-1">{source.percentage.toFixed(1)}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;