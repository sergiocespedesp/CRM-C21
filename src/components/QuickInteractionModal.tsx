import React, { useState } from 'react';
import { X, Phone, Mail, MessageCircle, Calendar, FileText, CheckCircle } from 'lucide-react';
import { LeadService } from '../services/leadService';
import type { InteractionType } from '../types';

interface QuickInteractionModalProps {
    leadId: string;
    leadName: string;
    advisorId?: string;
    onClose: () => void;
    onSave: () => void;
}

const QuickInteractionModal: React.FC<QuickInteractionModalProps> = ({ leadId, leadName, advisorId, onClose, onSave }) => {
    const [type, setType] = useState<InteractionType>('CALL');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await LeadService.addInteraction(leadId, {
                type,
                content,
                
                date: new Date().toISOString(),
                advisorId: (advisorId && advisorId.length > 20 && advisorId !== 'current_user') ? advisorId : undefined
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving interaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const types: { id: InteractionType; label: string; icon: any; color: string }[] = [
        { id: 'CALL', label: 'Llamada', icon: Phone, color: 'text-blue-600 bg-blue-50' },
        { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600 bg-green-50' },
        { id: 'EMAIL', label: 'Email', icon: Mail, color: 'text-indigo-600 bg-indigo-50' },
        { id: 'VISIT' as InteractionType, label: 'Visita / Reunión', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
        { id: 'NOTE', label: 'Nota', icon: FileText, color: 'text-gray-600 bg-gray-50' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="font-semibold text-gray-900">Registrar Acción</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Para: <span className="font-medium text-gray-700">{leadName}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                        {types.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setType(t.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                                    type === t.id
                                        ? `border-${t.color.split('-')[1]}-200 ${t.color} ring-1 ring-${t.color.split('-')[1]}-300` // Active state
                                        : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-500' // Inactive state
                                }`}
                            >
                                <t.icon size={20} />
                                <span className="text-[10px] font-medium">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas / Detalles
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe el resultado de la interacción..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black focus:outline-none transition-all min-h-[100px] text-sm resize-none"
                            autoFocus
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {['No Contesta', 'Buzón de Voz', 'Volver a llamar', 'Whatsapp Enviado'].map(text => (
                                <button
                                    type="button"
                                    key={text}
                                    onClick={() => setContent(text)}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="w-full btn btn-primary flex justify-center items-center gap-2 py-2.5"
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Registrar Interacción
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickInteractionModal;
