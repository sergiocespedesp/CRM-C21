import React, { useState } from 'react';
import { Send, CheckCircle, Code, ArrowRight, Settings, Zap, Users } from 'lucide-react';
import { LeadService } from '../services/leadService';
import type { InteractionOrigin } from '../types';

// Mock data generators
const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura', 'Miguel', 'Sofia', 'Roberto', 'Elena', 'Diego', 'Patricia', 'Fernando', 'Isabel', 'Javier', 'Claudia', 'Ricardo', 'Monica'];
const lastNames = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Ortiz', 'Gutiérrez', 'Jiménez', 'Hernández'];
const cities = ['Santa Cruz', 'La Paz', 'Cochabamba', 'Tarija', 'Sucre', 'Oruro', 'Potosí', 'Beni', 'Pando'];
const messages = [
    'Hola, quiero más información sobre el proyecto.',
    'Estoy buscando una casa en la zona norte.',
    'Me interesa conocer los departamentos disponibles.',
    '¿Tienen opciones de financiamiento?',
    'Quisiera agendar una visita.',
    'Necesito información sobre precios y disponibilidad.',
    'Estoy buscando un departamento de 2 dormitorios.',
    '¿Cuáles son las formas de pago?',
    'Me gustaría ver fotos del proyecto.',
    'Quiero información sobre la ubicación.'
];

const generateRandomLead = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomPhone = Math.floor(60000000 + Math.random() * 19999999);
    const randomEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
        firstName,
        lastName,
        phone: `+591 ${randomPhone}`,
        email: randomEmail,
        source: Math.random() > 0.5 ? 'Facebook Ads' : 'Instagram Ads',
        message
    };
};

const WebhookSimulator: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: 'Nuevo',
        lastName: 'Cliente',
        phone: '+591 70000000',
        email: 'cliente@ejemplo.com',
        source: 'Facebook Ads',
        message: 'Hola, quiero más información sobre el proyecto.'
    });

    const [origin, setOrigin] = useState<InteractionOrigin>('META_ADS');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    // Bulk generation state
    const [bulkCount, setBulkCount] = useState(50);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const [bulkResults, setBulkResults] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        try {
            const result = await LeadService.ingestLead({
                ...formData,
                origin
            });
            setResponse({ status: 'success', data: result });
        } catch (error) {
            setResponse({ status: 'error', message: 'Error processing webhook' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkGeneration = async () => {
        setBulkLoading(true);
        setBulkProgress(0);
        setBulkResults(null);
        setResponse(null);

        const results = {
            total: bulkCount,
            created: 0,
            updated: 0,
            errors: 0
        };

        for (let i = 0; i < bulkCount; i++) {
            try {
                const leadData = generateRandomLead();
                const result = await LeadService.ingestLead({
                    ...leadData,
                    origin: Math.random() > 0.3 ? 'META_ADS' : 'WHATSAPP_API'
                });
                
                if (result.isNew) {
                    results.created++;
                } else {
                    results.updated++;
                }
            } catch (error) {
                results.errors++;
            }
            
            setBulkProgress(Math.round(((i + 1) / bulkCount) * 100));
        }

        setBulkResults(results);
        setBulkLoading(false);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

                {/* Simulator Form */}
                <div className="card card-warning h-full flex flex-col">
                    <div className="card-header">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Settings size={18} className="text-[var(--text-muted)]" />
                            Configuración
                        </h3>
                    </div>

                    <div className="card-body overflow-y-auto flex-1">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Apellido</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Teléfono</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Origen</label>
                                <select
                                    value={origin}
                                    onChange={e => setOrigin(e.target.value as InteractionOrigin)}
                                    className="w-full"
                                >
                                    <option value="META_ADS">Meta Ads (Facebook/Instagram)</option>
                                    <option value="WHATSAPP_API">WhatsApp API</option>
                                    <option value="MANUAL">Manual / Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Mensaje Inicial</label>
                                <textarea
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full h-24 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-warning w-full gap-2 disabled:opacity-50 text-white font-bold shadow-md"
                            >
                                {loading ? 'Procesando...' : 'Simular Webhook'}
                                <Send size={16} />
                            </button>
                        </form>

                        {/* Bulk Generation Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <Users size={16} />
                                Generación Masiva
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">
                                        Cantidad de Leads
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={bulkCount}
                                        onChange={e => setBulkCount(parseInt(e.target.value) || 50)}
                                        className="w-full"
                                        disabled={bulkLoading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBulkGeneration}
                                    disabled={bulkLoading}
                                    className="btn btn-primary w-full gap-2 disabled:opacity-50 font-bold"
                                >
                                    {bulkLoading ? `Generando... ${bulkProgress}%` : 'Generar Leads Masivos'}
                                    <Zap size={16} />
                                </button>
                                
                                {bulkLoading && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${bulkProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response View */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    <div className="card card-primary flex-1 flex flex-col mb-0">
                        <div className="card-header">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Code size={18} className="text-[var(--text-muted)]" />
                                Registro del Sistema
                            </h3>
                            {response && (
                                <span className={`text-xs px-2 py-1 rounded font-bold text-white ${response.status === 'success' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'}`}>
                                    {response.status === 'success' ? '200 OK' : '500 Error'}
                                </span>
                            )}
                        </div>

                        <div className="card-body bg-[#222d32] text-[#b8c7ce] font-mono text-xs overflow-auto flex-1 p-0">
                            <div className="p-4">
                                {bulkResults ? (
                                    <div className="space-y-2">
                                        <div className="text-green-400 font-bold text-lg mb-4">
                                            ✓ Generación Masiva Completada
                                        </div>
                                        <pre className="whitespace-pre-wrap">
{JSON.stringify(bulkResults, null, 2)}
                                        </pre>
                                    </div>
                                ) : response ? (
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(response, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-center opacity-30 py-12">
                                        <Code size={32} className="mx-auto mb-2" />
                                        <p>Esperando ejecución...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {bulkResults && (
                        <div className="card card-success mb-0 flex-shrink-0 animate-fade-in">
                            <div className="card-body flex items-start gap-4">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-[var(--text-main)]">
                                        ¡Generación Completada!
                                    </h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Se procesaron {bulkResults.total} leads: {bulkResults.created} nuevos creados, {bulkResults.updated} actualizados.
                                        {bulkResults.errors > 0 && ` ${bulkResults.errors} errores.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {response?.data && !bulkResults && (
                        <div className={`card ${response.data.isNew ? 'card-success' : 'card-info'} mb-0 flex-shrink-0 animate-fade-in`}>
                            <div className="card-body flex items-start gap-4">
                                <div className={`p-3 rounded-full ${response.data.isNew ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {response.data.isNew ? <CheckCircle size={24} /> : <ArrowRight size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1 text-[var(--text-main)]">
                                        {response.data.isNew ? '¡Nuevo Lead Creado!' : 'Lead Existente Actualizado'}
                                    </h4>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {response.data.isNew
                                            ? 'Se ha creado un nuevo registro en la base de datos y se asignó un asesor automáticamente.'
                                            : 'Se detectó un duplicado por teléfono/email. Se agregó una nueva interacción al historial del lead existente.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebhookSimulator;