import React, { useEffect, useState } from 'react';
import { Settings, Zap, Play, Trash2, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { AutomationService, type AutomationSettings, type AutomationLog } from '../services/automationService';

const AutomationSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AutomationSettings>(AutomationService.getSettings());
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [stats, setStats] = useState(AutomationService.getAutomationStats());
    const [running, setRunning] = useState(false);
    const [filterAction, setFilterAction] = useState<string>('ALL');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = () => {
        setLogs(AutomationService.getLogs());
        setStats(AutomationService.getAutomationStats());
    };

    const handleSettingChange = (key: keyof AutomationSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        AutomationService.saveSettings(newSettings);
    };

    const handleThresholdChange = (key: 'hot' | 'warm', value: number) => {
        const newSettings = {
            ...settings,
            temperatureThresholds: {
                ...settings.temperatureThresholds,
                [key]: value
            }
        };
        setSettings(newSettings);
        AutomationService.saveSettings(newSettings);
    };

    const handleRunAutomations = async () => {
        setRunning(true);
        try {
            const results = await AutomationService.runAllAutomations();
            alert(`Automatizaciones ejecutadas:\n- Escalados: ${results.escalated}\n- Recordatorios: ${results.reminders}\n- Temperaturas ajustadas: ${results.temperaturesAdjusted}`);
            loadLogs();
        } catch (error) {
            console.error('Error running automations:', error);
            alert('Error al ejecutar automatizaciones');
        } finally {
            setRunning(false);
        }
    };

    const handleClearLogs = () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los logs?')) {
            AutomationService.clearLogs();
            loadLogs();
        }
    };

    const getActionLabel = (action: string) => {
        const labels: { [key: string]: string } = {
            'ASSIGNMENT': 'Asignación',
            'ESCALATION': 'Escalación',
            'REMINDER': 'Recordatorio',
            'TEMPERATURE': 'Temperatura'
        };
        return labels[action] || action;
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'ASSIGNMENT': return <TrendingUp size={16} className="text-blue-500" />;
            case 'ESCALATION': return <AlertCircle size={16} className="text-orange-500" />;
            case 'REMINDER': return <Clock size={16} className="text-purple-500" />;
            case 'TEMPERATURE': return <Zap size={16} className="text-green-500" />;
            default: return <Settings size={16} />;
        }
    };

    const filteredLogs = filterAction === 'ALL'
        ? logs
        : logs.filter(log => log.action === filterAction);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)]">Automatizaciones</h1>
                    <p className="text-[var(--text-muted)] mt-1">Configuración de reglas automáticas del CRM</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRunAutomations}
                        disabled={running}
                        className="btn btn-primary gap-2"
                    >
                        {running ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Ejecutando...
                            </>
                        ) : (
                            <>
                                <Play size={16} /> Ejecutar Ahora
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm opacity-90">Total Ejecuciones</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.totalRuns}</h3>
                            </div>
                            <Zap size={32} className="opacity-75" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm opacity-90">Tasa de Éxito</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.successRate.toFixed(1)}%</h3>
                            </div>
                            <CheckCircle size={32} className="opacity-75" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm opacity-90">Última Ejecución</p>
                                <h3 className="text-lg font-bold mt-2">
                                    {stats.lastRun ? new Date(stats.lastRun).toLocaleString('es-ES') : 'Nunca'}
                                </h3>
                            </div>
                            <Clock size={32} className="opacity-75" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h3 className="text-lg font-bold mb-4">Configuración de Automatizaciones</h3>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold">Asignación Inteligente</h4>
                                <p className="text-sm text-[var(--text-muted)]">Asigna leads automáticamente al asesor con menor carga de trabajo</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.intelligentAssignment}
                                    onChange={(e) => handleSettingChange('intelligentAssignment', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold">Escalación Automática</h4>
                                <p className="text-sm text-[var(--text-muted)]">Escala leads sin actividad por más de {settings.escalationDays} días</p>
                                {settings.autoEscalation && (
                                    <div className="mt-3">
                                        <label className="text-sm font-medium">Días sin actividad:</label>
                                        <input
                                            type="range"
                                            min="3"
                                            max="30"
                                            value={settings.escalationDays}
                                            onChange={(e) => handleSettingChange('escalationDays', Number(e.target.value))}
                                            className="w-full mt-2"
                                        />
                                        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                                            <span>3 días</span>
                                            <span className="font-bold text-blue-600">{settings.escalationDays} días</span>
                                            <span>30 días</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input
                                    type="checkbox"
                                    checked={settings.autoEscalation}
                                    onChange={(e) => handleSettingChange('autoEscalation', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold">Generación de Recordatorios</h4>
                                <p className="text-sm text-[var(--text-muted)]">Crea notificaciones para próximas acciones (24h antes)</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.reminderGeneration}
                                    onChange={(e) => handleSettingChange('reminderGeneration', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-semibold">Ajuste de Temperatura</h4>
                                <p className="text-sm text-[var(--text-muted)]">Actualiza temperatura de leads según actividad reciente</p>
                                {settings.temperatureAdjustment && (
                                    <div className="mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Caliente (días):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={settings.temperatureThresholds.hot}
                                                onChange={(e) => handleThresholdChange('hot', Number(e.target.value))}
                                                className="w-full mt-1 px-3 py-2 border rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Tibio (días):</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={settings.temperatureThresholds.warm}
                                                onChange={(e) => handleThresholdChange('warm', Number(e.target.value))}
                                                className="w-full mt-1 px-3 py-2 border rounded"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-4">
                                <input
                                    type="checkbox"
                                    checked={settings.temperatureAdjustment}
                                    onChange={(e) => handleSettingChange('temperatureAdjustment', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Historial de Automatizaciones</h3>
                        <div className="flex gap-2">
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="px-3 py-2 border rounded text-sm"
                            >
                                <option value="ALL">Todas</option>
                                <option value="ASSIGNMENT">Asignaciones</option>
                                <option value="ESCALATION">Escalaciones</option>
                                <option value="REMINDER">Recordatorios</option>
                                <option value="TEMPERATURE">Temperaturas</option>
                            </select>
                            <button onClick={handleClearLogs} className="btn btn-outline btn-sm gap-2">
                                <Trash2 size={14} /> Limpiar Logs
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3 text-left font-semibold">Fecha/Hora</th>
                                    <th className="p-3 text-left font-semibold">Acción</th>
                                    <th className="p-3 text-left font-semibold">Lead</th>
                                    <th className="p-3 text-left font-semibold">Detalles</th>
                                    <th className="p-3 text-center font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                                            No hay logs de automatizaciones
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="p-3 text-sm">
                                                {new Date(log.timestamp).toLocaleString('es-ES')}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {getActionIcon(log.action)}
                                                    <span className="text-sm font-medium">{getActionLabel(log.action)}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm font-medium">{log.leadName}</td>
                                            <td className="p-3 text-sm text-[var(--text-muted)]">{log.details}</td>
                                            <td className="p-3 text-center">
                                                {log.success ? (
                                                    <CheckCircle size={18} className="text-green-500 mx-auto" />
                                                ) : (
                                                    <AlertCircle size={18} className="text-red-500 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationSettingsPage;
