import React, { useState } from 'react';
import { X, Calendar, Building2, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import type { VisitChecklist, Property } from '../types';

interface VisitChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (checklist: VisitChecklist) => Promise<void>;
  leadId: string;
  leadName: string;
  properties: Property[];
}

const OBJECTION_OPTIONS = [
  'Precio muy alto',
  'Ubicación no conveniente',
  'Tamaño insuficiente',
  'Problemas de financiamiento',
  'Necesita remodelación',
  'Falta de amenidades',
  'Otros'
];

const POSITIVE_OPTIONS = [
  'Excelente diseño',
  'Ubicación privilegiada',
  'Precio competitivo',
  'Buenas amenidades',
  'Buen estado de conservación',
  'Potencial de inversión',
  'Otros'
];

export const VisitChecklistModal: React.FC<VisitChecklistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leadName,
  properties
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<VisitChecklist>>({
    propertyId: '',
    propertyName: '',
    visitDate: new Date().toISOString().slice(0, 16),
    clientInterest: 'medium',
    clientAttended: true,
    objections: [],
    customObjections: '',
    positiveReactions: [],
    nextSteps: '',
    estimatedClosingDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    const property = properties.find(p => p.id === propertyId);
    setFormData({
      ...formData,
      propertyId,
      propertyName: property?.name || ''
    });
    setErrors({ ...errors, propertyId: '' });
  };

  const handleObjectionToggle = (objection: string) => {
    const current = formData.objections || [];
    const updated = current.includes(objection)
      ? current.filter(o => o !== objection)
      : [...current, objection];
    setFormData({ ...formData, objections: updated });
  };

  const handlePositiveToggle = (positive: string) => {
    const current = formData.positiveReactions || [];
    const updated = current.includes(positive)
      ? current.filter(p => p !== positive)
      : [...current, positive];
    setFormData({ ...formData, positiveReactions: updated });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = 'Debe seleccionar una propiedad';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'La fecha de visita es requerida';
    } else {
      const visitDate = new Date(formData.visitDate);
      const now = new Date();
      if (visitDate > now) {
        newErrors.visitDate = 'La fecha no puede ser futura';
      }
    }

    if (formData.clientAttended && !formData.clientInterest) {
      newErrors.clientInterest = 'Debe indicar el nivel de interés';
    }

    if (!formData.nextSteps?.trim()) {
      newErrors.nextSteps = 'Los próximos pasos son requeridos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await onSave(formData as VisitChecklist);
      onClose();
      // Reset form
      setFormData({
        propertyId: '',
        propertyName: '',
        visitDate: new Date().toISOString().slice(0, 16),
        clientInterest: 'medium',
        clientAttended: true,
        objections: [],
        customObjections: '',
        positiveReactions: [],
        nextSteps: '',
        estimatedClosingDate: '',
        notes: ''
      });
    } catch (error) {
      console.error('[VisitChecklistModal] Error saving:', error);
      alert('Error al guardar la visita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registrar Visita</h2>
            <p className="text-sm text-gray-500">Lead: {leadName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Propiedad Visitada *
            </label>
            <select
              value={formData.propertyId}
              onChange={handlePropertyChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.propertyId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una propiedad</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.zone}
                </option>
              ))}
            </select>
            {errors.propertyId && (
              <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>
            )}
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha y Hora de Visita *
            </label>
            <input
              type="datetime-local"
              value={formData.visitDate}
              onChange={(e) => {
                setFormData({ ...formData, visitDate: e.target.value });
                setErrors({ ...errors, visitDate: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.visitDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.visitDate && (
              <p className="text-red-500 text-sm mt-1">{errors.visitDate}</p>
            )}
          </div>

          {/* Client Attended */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="clientAttended"
              checked={formData.clientAttended}
              onChange={(e) => setFormData({ ...formData, clientAttended: e.target.checked })}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="clientAttended" className="text-sm font-medium text-gray-700">
              El cliente asistió a la visita
            </label>
          </div>

          {/* Interest Level */}
          {formData.clientAttended && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Interés *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, clientInterest: level })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.clientInterest === level
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'none' && 'Ninguno'}
                    {level === 'low' && 'Bajo'}
                    {level === 'medium' && 'Medio'}
                    {level === 'high' && 'Alto'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Objections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ThumbsDown className="w-4 h-4 inline mr-1" />
              Objeciones del Cliente
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OBJECTION_OPTIONS.map((objection) => (
                <label
                  key={objection}
                  className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.objections?.includes(objection)}
                    onChange={() => handleObjectionToggle(objection)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm">{objection}</span>
                </label>
              ))}
            </div>
            {formData.objections?.includes('Otros') && (
              <textarea
                value={formData.customObjections}
                onChange={(e) => setFormData({ ...formData, customObjections: e.target.value })}
                placeholder="Especifique otras objeciones..."
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows={2}
              />
            )}
          </div>

          {/* Positive Reactions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ThumbsUp className="w-4 h-4 inline mr-1" />
              Aspectos que le Gustaron
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIVE_OPTIONS.map((positive) => (
                <label
                  key={positive}
                  className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.positiveReactions?.includes(positive)}
                    onChange={() => handlePositiveToggle(positive)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm">{positive}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Próximos Pasos *
            </label>
            <textarea
              value={formData.nextSteps}
              onChange={(e) => {
                setFormData({ ...formData, nextSteps: e.target.value });
                setErrors({ ...errors, nextSteps: '' });
              }}
              placeholder="Ej: Enviar propuesta formal, agendar segunda visita, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.nextSteps ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
            />
            {errors.nextSteps && (
              <p className="text-red-500 text-sm mt-1">{errors.nextSteps}</p>
            )}
          </div>

          {/* Estimated Closing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Estimada de Cierre (Opcional)
            </label>
            <input
              type="date"
              value={formData.estimatedClosingDate}
              onChange={(e) => setFormData({ ...formData, estimatedClosingDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones adicionales sobre la visita..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
