import React, { useState } from 'react';
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty } from '../hooks/useProperties';
import { Plus, Search, Filter, MapPin, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Property } from '../types';

const COMMON_EQUIPMENT = [
    'Aire Acondicionado', 'Termotanque/Calefon', 'Cocina eléctrica', 'Extractor', 
    'Horno eléctrico', 'Heladera', 'Cajoneria alta y baja cocina', 'Cajoneria baja baño', 
    'Blindex baño', 'Puertas ropero', 'Divisiones internas ropero', 'Walking closet',
    'Chapa Digital', 'Luces Led', 'Espejo en baño', 'Microondas', 'Domótica', 
    'No viene equipado', 'Mesón desayunador', 'Gas Domiciliario'
];

const COMMON_AMENITIES = [
    'Piscina', 'Gimnasio', 'Churrasquera', 'Salón de Eventos', 'Parque Infantil', 
    'Co-Work', 'Sauna', 'Cine', 'Seguridad 24hs', 'Lobby de lujo', 'Sala de juegos'
];

const COMMON_PAYMENT_METHODS = [
    'Contado', 'Crédito bancario', 'Financiamiento directo', 
    '50% inicial, 50% contra entrega', '20% inicial, saldo contra entrega', 
    '30% inicial, 70% contra entrega'
];

const COMMON_ZONES = ['Equipetrol', 'Norte', 'Centro', 'Oeste', 'Sur', 'Urbarí', 'Las Palmas'];

const MultiSelectPills = ({ 
    options, 
    value, 
    onChange, 
    allowCustom = true 
}: { 
    options: string[], 
    value: string | string[], 
    onChange: (val: string[]) => void, 
    allowCustom?: boolean 
}) => {
    const selected = Array.isArray(value) ? value : (typeof value === 'string' && value ? value.split(',').map(s => s.trim()).filter(Boolean) : []);
    const [customVal, setCustomVal] = useState('');

    const toggle = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(s => s !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const addCustom = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customVal.trim()) {
            e.preventDefault();
            if (!selected.includes(customVal.trim())) {
                onChange([...selected, customVal.trim()]);
            }
            setCustomVal('');
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={'px-3 py-1 rounded-full text-xs border transition-colors ' + (selected.includes(opt) ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {allowCustom && (
                <input 
                    type="text" 
                    placeholder="Escribir otro y presionar Enter..." 
                    className="w-full text-sm border-gray-300 rounded-md"
                    value={customVal}
                    onChange={e => setCustomVal(e.target.value)}
                    onKeyDown={addCustom}
                />
            )}
             <div className="flex flex-wrap gap-2 mt-2">
                {selected.filter(s => !options.includes(s)).map(s => (
                     <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs">
                        {s} <button type="button" onClick={() => toggle(s)}><X size={12}/></button>
                     </span>
                ))}
            </div>
        </div>
    );
};

const Inmuebles: React.FC = () => {
    const { data: properties = [], isLoading } = useProperties();
    const createProperty = useCreateProperty();
    const updateProperty = useUpdateProperty();
    const deleteProperty = useDeleteProperty();

    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyForm, setPropertyForm] = useState<Partial<Property>>({});

    const handleEditProperty = (property: Property) => {
        setEditingProperty(property);
        setPropertyForm({
            ...property,
            paymentMethods: property.paymentMethods || [],
            equipment: property.equipment || [],
            amenities: property.amenities || []
        });
        setIsPropertyModalOpen(true);
    };

    const handleDeleteProperty = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar este inmueble?')) {
            try {
                await deleteProperty.mutateAsync(id);
                toast.success('Inmueble eliminado');
            } catch (error) {
                toast.error('Error al eliminar');
            }
        }
    };

    const handleSaveProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean Data
            const { isProject, ...restForm } = propertyForm as any;
            
            const propertyData = {
                ...restForm,
                // Validations
                price: propertyForm.price ? Number(propertyForm.price) : null,
                landArea: propertyForm.landArea ? Number(propertyForm.landArea) : null,
                builtArea: propertyForm.builtArea ? Number(propertyForm.builtArea) : null,
                bathrooms: propertyForm.bathrooms ? Number(propertyForm.bathrooms) : null,
                garages: propertyForm.garages ? Number(propertyForm.garages) : null,
                pricePerSqmFrom: propertyForm.pricePerSqmFrom ? Number(propertyForm.pricePerSqmFrom) : null,
                pricePerSqmTo: propertyForm.pricePerSqmTo ? Number(propertyForm.pricePerSqmTo) : null,
                exchangeRate: propertyForm.exchangeRate ? Number(propertyForm.exchangeRate) : 6.96,
                
                // Dates
                deliveryDate: propertyForm.deliveryDate ? new Date(propertyForm.deliveryDate) : null,
                
                // Arrays
                images: propertyForm.images?.length ? propertyForm.images : [],
                paymentMethods: Array.isArray(propertyForm.paymentMethods) ? propertyForm.paymentMethods : [],
                equipment: Array.isArray(propertyForm.equipment) ? propertyForm.equipment : [],
                amenities: Array.isArray(propertyForm.amenities) ? propertyForm.amenities : [],
                
                // Defaults
                currency: propertyForm.currency || 'USD',
                status: propertyForm.status || 'AVAILABLE',
            };

            if (editingProperty) {
                await updateProperty.mutateAsync({ id: editingProperty.id, data: propertyData });
                toast.success('Inmueble actualizado');
            } else {
                await createProperty.mutateAsync(propertyData);
                toast.success('Inmueble creado exitosamente');
            }
            setIsPropertyModalOpen(false);
            setEditingProperty(null);
            setPropertyForm({});
        } catch (error: any) {
            console.error(error);
            toast.error('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPropertyForm(prev => ({
                        ...prev,
                        images: [...(prev.images || []), reader.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setPropertyForm(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Buscar inmueble..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-[var(--text-main)] transition-colors shadow-sm">
                        <Filter size={20} />
                        Filtros
                    </button>
                    <button
                        onClick={() => {
                            setEditingProperty(null);
                            setPropertyForm({});
                            setIsPropertyModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/20"
                    >
                        <Plus size={20} />
                        Nuevo
                    </button>
                </div>
            </div>

            {/* Property List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                            {property.images?.[0] ? (
                                <img src={property.images[0]} alt={property.title || property.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-md backdrop-blur-sm uppercase font-bold">
                                    {property.transaction || 'VENTA'}
                                </span>
                                <span className="px-2 py-1 bg-white/90 text-[var(--color-primary)] text-xs rounded-md backdrop-blur-sm uppercase font-bold shadow-sm">
                                    {property.type || 'PROYECTO'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-[var(--text-main)] text-lg mb-1">{property.title || property.name || 'Sin Título'}</h3>
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                                <MapPin size={14} className="mr-1" />
                                {property.location || property.address || property.zone || 'Ubicación no especificada'}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {property.images?.slice(1, 4).map((img, idx) => (
                                    <div key={idx} className="h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Precio de venta</p>
                                    <p className="text-xl font-bold text-[var(--color-secondary)]">
                                        {property.price ? `${Number(property.price).toLocaleString()} ${property.currency}` : 'Consultar'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditProperty(property)}
                                        className="p-2 text-gray-400 hover:text-[var(--text-main)] hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProperty(property.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isPropertyModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-[var(--text-main)]">
                                {editingProperty ? 'Editar Inmueble' : 'Nuevo Inmueble'}
                            </h2>
                            <button onClick={() => setIsPropertyModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[var(--text-main)] border-b pb-2 text-xs tracking-wider">Información Básica</h3>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Nombre del Proyecto / Inmueble</label>
                                        <input
                                            type="text"
                                            required
                                            value={propertyForm.title || propertyForm.name || ''}
                                            onChange={e => setPropertyForm({ ...propertyForm, title: e.target.value, name: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Tipo</label>
                                            <select
                                                value={propertyForm.type || 'PROJECT'}
                                                onChange={e => setPropertyForm({ ...propertyForm, type: e.target.value })}
                                                className="w-full border-gray-300 rounded-lg"
                                            >
                                                <option value="PROJECT">Proyecto</option>
                                                <option value="HOUSE">Casa</option>
                                                <option value="APARTMENT">Departamento</option>
                                                <option value="LAND">Terreno</option>
                                                <option value="OFFICE">Oficina</option>
                                                <option value="COMMERCIAL">Local Comercial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Operación</label>
                                            <select
                                                value={propertyForm.transaction || 'SALE'}
                                                onChange={e => setPropertyForm({ ...propertyForm, transaction: e.target.value })}
                                                className="w-full border-gray-300 rounded-lg"
                                            >
                                                <option value="SALE">Venta</option>
                                                <option value="RENT">Alquiler</option>
                                                <option value="ANTICRETICO">Anticrético</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Zona</label>
                                        <input
                                            list="zones-list"
                                            type="text"
                                            value={propertyForm.zone || ''}
                                            onChange={e => setPropertyForm({ ...propertyForm, zone: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg"
                                        />
                                        <datalist id="zones-list">
                                            {COMMON_ZONES.map(z => <option key={z} value={z} />)}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Dirección</label>
                                        <input
                                            type="text"
                                            value={propertyForm.address || propertyForm.location || ''}
                                            onChange={e => setPropertyForm({ ...propertyForm, address: e.target.value, location: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg"
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Link Ubicación (Maps)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                value={propertyForm.mapUrl || ''}
                                                onChange={e => setPropertyForm({ ...propertyForm, mapUrl: e.target.value })}
                                                className="pl-10 w-full border-gray-300 rounded-lg"
                                                placeholder="https://maps.app.goo.gl/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[var(--text-main)] border-b pb-2 text-xs tracking-wider">Información Adicional</h3>
                                    
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Fecha de Entrega</label>
                                            <div className="relative">
                                                 <input
                                                    type="date"
                                                    value={propertyForm.deliveryDate ? new Date(propertyForm.deliveryDate).toISOString().split('T')[0] : ''}
                                                    onChange={e => setPropertyForm({ ...propertyForm, deliveryDate: e.target.value ? new Date(e.target.value) : undefined })}
                                                    className="w-full border-gray-300 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                         <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Disponibilidad</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Inmediata, En construcción"
                                                value={propertyForm.availability || ''}
                                                onChange={e => setPropertyForm({ ...propertyForm, availability: e.target.value })}
                                                className="w-full border-gray-300 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Precio m<sup>2</sup> Desde ($)</label>
                                            <input
                                                type="number"
                                                value={propertyForm.pricePerSqmFrom || ''}
                                                onChange={e => setPropertyForm({ ...propertyForm, pricePerSqmFrom: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full border-gray-300 rounded-lg"
                                                placeholder="1500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Precio m<sup>2</sup> Hasta ($)</label>
                                            <input
                                                type="number"
                                                value={propertyForm.pricePerSqmTo || ''}
                                                onChange={e => setPropertyForm({ ...propertyForm, pricePerSqmTo: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full border-gray-300 rounded-lg"
                                                placeholder="2500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                         <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Precio Global ($)</label>
                                            <input
                                                type="number"
                                                value={propertyForm.price || ''}
                                                onChange={e => setPropertyForm({ ...propertyForm, price: e.target.value ? Number(e.target.value) : undefined })}
                                                className="w-full border-gray-300 rounded-lg"
                                                placeholder="Total del proyecto"
                                            />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Formas de Pago</label>
                                        <MultiSelectPills 
                                            options={COMMON_PAYMENT_METHODS} 
                                            value={propertyForm.paymentMethods || []} 
                                            onChange={val => setPropertyForm({...propertyForm, paymentMethods: val})} 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-4">
                                <h3 className="font-bold text-[var(--text-main)] border-b pb-2 text-xs tracking-wider">Características y Amenidades</h3>
                                
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Equipamiento</label>
                                    <MultiSelectPills 
                                        options={COMMON_EQUIPMENT} 
                                        value={propertyForm.equipment || []} 
                                        onChange={val => setPropertyForm({...propertyForm, equipment: val})} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Amenidades</label>
                                    <MultiSelectPills 
                                        options={COMMON_AMENITIES} 
                                        value={propertyForm.amenities || []} 
                                        onChange={val => setPropertyForm({...propertyForm, amenities: val})} 
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-xs font-bold text-[var(--text-main)] mb-2">Imágenes</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-gray-50 hover:bg-white" onClick={() => document.getElementById('images-upload')?.click()}>
                                    <input
                                        id="images-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                    <span className="text-sm text-gray-500 font-medium">Click para subir Imágenes</span>
                                    <p className="text-xs text-gray-400 mt-1">Máx 5MB por imagen</p>
                                </div>
                                {propertyForm.images && propertyForm.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                        {propertyForm.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsPropertyModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg shadow-[var(--color-primary)]/25 flex items-center gap-2"
                                >
                                    <Edit2 size={16} />
                                    {editingProperty ? 'Actualizar Inmueble' : 'Guardar Inmueble'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inmuebles;
