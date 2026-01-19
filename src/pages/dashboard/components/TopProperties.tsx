import React from 'react';
import { Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TopPropertiesProps {
    leadsByProperty: Record<string, number>;
}

const TopProperties: React.FC<TopPropertiesProps> = ({ leadsByProperty }) => {

    // Transform record to array for Recharts
    const data = Object.entries(leadsByProperty)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="card bg-white shadow-sm h-full">
            <div className="card-header p-4 border-b border-[var(--border-light)]">
                <h3 className="font-semibold text-lg text-[var(--text-main)] flex items-center gap-2">
                    <Building2 size={18} className="text-[var(--text-muted)]" /> Top Inmuebles
                </h3>
            </div>
            <div className="p-4 h-[250px] relative">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
            <div className="px-4 pb-4">
                <div className="space-y-1">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="truncate max-w-[150px]">{entry.name}</span>
                            </div>
                            <span className="font-bold">{entry.value} Leads</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopProperties;
