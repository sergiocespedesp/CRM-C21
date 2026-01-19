import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeadService } from '../services/leadService';
import type { Lead, PipelineStage } from '../types';
import { TrendingUp, Users } from 'lucide-react';

interface StageCount {
  stage: PipelineStage;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export const PipelineOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stageCounts, setStageCounts] = useState<StageCount[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  const stageConfig: Partial<Record<PipelineStage, { label: string; color: string }>> = {
    NEW: { label: 'Nuevo', color: 'bg-blue-500' },
    INFO_SENT: { label: 'Info Enviada', color: 'bg-cyan-500' },
    CONTACTED: { label: 'Contactado', color: 'bg-indigo-500' },
    QUALIFIED: { label: 'Calificado', color: 'bg-purple-500' },
    PRESENTATION: { label: 'Presentación', color: 'bg-violet-500' },
    VISIT: { label: 'Visita', color: 'bg-pink-500' },

    NEGOTIATION: { label: 'Negociación', color: 'bg-orange-500' },
    CLOSED_WON: { label: 'Ganado', color: 'bg-green-500' },

    DISCARDED: { label: 'Descartado', color: 'bg-gray-300' }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const leads = await LeadService.getAllLeads();
      
      const activeLeads = leads.filter(
        (lead: Lead) => lead.stage !== 'CLOSED_WON'
      );
      
      setTotalLeads(activeLeads.length);

      const counts: Record<string, number> = {};

      activeLeads.forEach((lead: Lead) => {
        if (stageConfig[lead.stage]) {
          counts[lead.stage] = (counts[lead.stage] || 0) + 1;
        }
      });

      const stageData: StageCount[] = Object.entries(counts)
        .filter(([stage]) => stage !== 'CLOSED_WON' && stage !== 'DISCARDED')
        .map(([stage, count]) => {
          const config = stageConfig[stage as PipelineStage];
          if (!config) return null;
          return {
            stage: stage as PipelineStage,
            label: config.label,
            count,
            percentage: activeLeads.length > 0 ? (count / activeLeads.length) * 100 : 0,
            color: config.color
          };
        })
        .filter((item): item is StageCount => item !== null);

      setStageCounts(stageData);
    } catch (error) {
      console.error('[PipelineOverview] Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (_stage: PipelineStage) => {
    navigate('/kanban');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Activo</h3>
            <p className="text-sm text-gray-500">Estado de oportunidades</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
          <Users className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-900">{totalLeads} leads</span>
        </div>
      </div>

      <div className="space-y-3">
        {stageCounts.map((stageData) => (
          <div
            key={stageData.stage}
            onClick={() => handleStageClick(stageData.stage)}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {stageData.label}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {stageData.count}
              </span>
            </div>
            
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden group-hover:h-3 transition-all">
              <div
                className={`absolute inset-y-0 left-0 ${stageData.color} rounded-full transition-all duration-300 group-hover:opacity-90`}
                style={{ width: `${stageData.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/kanban')}
          className="w-full text-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
        >
          Ver Pipeline Completo 
        </button>
      </div>
    </div>
  );
};


