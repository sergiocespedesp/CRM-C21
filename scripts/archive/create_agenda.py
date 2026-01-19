# -*- coding: utf-8 -*-
content = """import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, X, Trash2, Save, Edit2 } from 'lucide-react';
import type { InteractionType, Lead } from '../../../types';

export interface AgendaItem {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: InteractionType | 'TASK' | 'NEXT_ACTION';
    leadName?: string;
    leadId?: string;
    description?: string;
    color?: string;
}

interface AgendaViewProps {
    items: AgendaItem[];
    leads: Lead[];
    onAddEvent: (event: Partial<AgendaItem>) => Promise<void>;
    onUpdateEvent: (id: string, updates: Partial<AgendaItem>) => Promise<void>;
    onDeleteEvent: (id: string) => Promise<void>;
}

const AgendaView: React.FC<AgendaViewProps> = ({ items, leads, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
        <div className="card bg-white shadow-sm h-full flex flex-col">
            <div className="card-header p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('day')} className={\`px-3 py-1 rounded \${viewMode === 'day' ? 'bg-purple-600 text-white' : 'bg-gray-100'}\`}>Day</button>
                    <button onClick={() => setViewMode('week')} className={\`px-3 py-1 rounded \${viewMode === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-100'}\`}>Week</button>
                    <button onClick={() => setViewMode('month')} className={\`px-3 py-1 rounded \${viewMode === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-100'}\`}>Month</button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary ml-2"><Plus size={18} /> New Event</button>
                </div>
            </div>
            <div className="flex-1 p-4">
                <div className="text-center text-gray-500 py-8">Calendar View - {viewMode}</div>
            </div>
        </div>
    );
};

export default AgendaView;"""

with open(r'c:/Users/sergi/.gemini/antigravity/brain/0f12f6a2-8c6d-4c4c-80e9-34ae28be7be4/CRM-C21/src/pages/dashboard/components/AgendaView.tsx', 'w', encoding='utf-8-sig') as f:
    f.write(content)

print("Simplified AgendaView created successfully")
