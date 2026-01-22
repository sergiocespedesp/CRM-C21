import React, { useState } from 'react';
import { X } from 'lucide-react';
interface LeadFormProps {
    onSave: (leadData: LeadFormData) => Promise<void>;
    onCancel: () => void;
}
export interface LeadFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string;
    budget?: string;
    preferredZone?: string;
    timing?: string;
    city: string;
}
const LeadForm: React.FC<LeadFormProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<LeadFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: 'Manual',
        budget: '',
        preferredZone: '',
        timing: '',
        city: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
        if (!formData.email.trim()) newErrors.email = 'Email es requerido';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error: any) {
            console.error('Error saving lead:', error);
            const message = error.response?.data?.message || error.message || 'Error al guardar el lead';
            alert(`Error: ${message}`);
        } finally {
            setLoading(false);
        }
    };
    const budgetOptions = [
        { value: 'under_50k', label: 'Menos de $50k' },
        { value: '50k_100k', label: '$50k - $100k' },
        { value: '100k_200k', label: '$100k - $200k' },
        { value: '200k_500k', label: '$200k - $500k' },
        { value: 'over_500k', label: 'Más de $500k' }
    ];
    const timingOptions = [
        { value: 'immediate', label: 'Inmediato (este mes)' },
        { value: '1_3_months', label: '1-3 meses' },
        { value: '3_6_months', label: '3-6 meses' },
        { value: 'exploring', label: 'Solo explorando' }
    ];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Nuevo Lead</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Información Básica */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Juan"
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Apellido <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Pérez"
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="juan.perez@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+591 70123456"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fuente</label>
                        <select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="fb">fb</option>
                            <option value="ig">ig</option>
                            <option value="Asesor C21">Asesor C21</option>
                            <option value="Asesor Externo">Asesor Externo</option>
                            <option value="Bitly">Bitly</option>
                            <option value="Contacto directo">Contacto directo</option>
                            <option value="Letrero">Letrero</option>
                            <option value="Marketplace">Marketplace</option>
                            <option value="Otro">Otro</option>
                            <option value="Recuperado">Recuperado</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Ultracasas">Ultracasas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Ej: La Paz, Santa Cruz, El Alto"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    {/* Campos de Calificación */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-semibold mb-3 text-gray-700">Información de Calificación</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Presupuesto
                                    <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
                                </label>
                                <select
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Seleccionar...</option>
                                    {budgetOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Zona de Interés
                                    <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.preferredZone}
                                    onChange={(e) => setFormData({ ...formData, preferredZone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Ej: Zona Sur, Calacoto, Sopocachi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Timing de Compra
                                    <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
                                </label>
                                <select
                                    value={formData.timing}
                                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Seleccionar...</option>
                                    {timingOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default LeadForm;