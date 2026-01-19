import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, MoreVertical } from 'lucide-react';
import type { AgendaEvent } from '../types';

interface AgendaViewProps {
  events: AgendaEvent[];
  onAddEvent: (event: Omit<AgendaEvent, 'id'>) => void;
  onUpdateEvent: (event: AgendaEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: AgendaEvent) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ events, onEventClick }) => {
  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="flex flex-col h-full bg-white">
      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-gray-400">
          <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm italic">No hay eventos en la agenda</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[420px]">
            {sortedEvents.map(event => (
                <div 
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-[#BEAF87]/50 hover:bg-gray-50 transition-all cursor-pointer group"
                >
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-[#BEAF87]/30 transition-colors">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                            {new Date(event.start).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                        <span className="text-xl font-bold text-gray-900 leading-none">
                            {new Date(event.start).getDate()}
                        </span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-[#BEAF87] transition-colors">
                            {event.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                             {event.type && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                    {event.type}
                                </span>
                             )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-8 text-gray-300 group-hover:text-[#BEAF87] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AgendaView;
