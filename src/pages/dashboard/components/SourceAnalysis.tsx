import React from 'react';
import { Globe } from 'lucide-react';

interface SourceAnalysisProps {
    leadsBySource: Record<string, number>;
}

const SourceAnalysis: React.FC<SourceAnalysisProps> = ({ leadsBySource }) => {

    const data = Object.entries(leadsBySource)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const maxVal = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="card bg-white shadow-sm h-full">
            <div className="card-header p-4 border-b border-[var(--border-light)]">
                <h3 className="font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
                    <Globe size={18} className="text-[var(--text-muted)]" /> Fuentes (Hoy)
                </h3>
            </div>
            <div className="p-4 space-y-4">
                {data.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-8">No data available</div>
                ) : (
                    data.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium capitalize">{item.name.toLowerCase()}</span>
                                <span className="text-gray-500">{item.value} / {Math.round((item.value / maxVal) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-[var(--color-secondary)] h-2 rounded-full"
                                    style={{ width: `${(item.value / maxVal) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SourceAnalysis;
