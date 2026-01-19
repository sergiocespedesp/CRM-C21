
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, MapPin, Ruler, BedDouble, Bath, Car, Plus, Edit, Trash2, Home, LayoutGrid, DollarSign, Image as ImageIcon, Upload, X, AlertTriangle } from 'lucide-react';
import type { Property, PropertyUnit, PropertyType, PropertyStatus, Currency, TransactionType, BedroomCount, Advisor } from '../types';
import { useProperties, useUnits, useCreateProperty, useUpdateProperty, useDeleteProperty, useCreateUnit, useUpdateUnit } from '../hooks/useProperties';
import { useAdvisors } from '../hooks/useAdvisors';
import Modal from '../components/Modal';
import ImageGallery from '../components/ImageGallery';

const Inmuebles: React.FC = () => {
    // Hooks
    const { data: properties = [], isLoading: loadingProps } = useProperties();
    const { data: units = [], isLoading: loadingUnits } = useUnits();
    const { data: advisors = [], isLoading: loadingAdvisors } = useAdvisors();
    
    // Mutations
    const createProperty = useCreateProperty();
    const updateProperty = useUpdateProperty();
    const deleteProperty = useDeleteProperty();
    const createUnit = useCreateUnit();
    const updateUnit = useUpdateUnit();

    const loading = loadingProps || loadingUnits || loadingAdvisors;
    
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Initial Selection Effect
    useEffect(() => {
        if (!loading && properties.length > 0 && !selectedPropertyId) {
             if (!selectedPropertyId || !properties.find(p => p.id === selectedPropertyId)) {
                setSelectedPropertyId(properties[0].id);
            }
        } else if (!loading && properties.length === 0) {
            setSelectedPropertyId(null);
        }
    }, [properties, loading, selectedPropertyId]);

    // Property Modal State
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [propertyForm, setPropertyForm] = useState<Partial<Property>>({
        type: 'PROJECT',
        transaction: 'SALE',
        currency: 'USD',
        status: 'AVAILABLE',
        images: []
    });

    // Unit Modal State
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<PropertyUnit | null>(null);
    const [unitForm, setUnitForm] = useState<Partial<PropertyUnit>>({
        currency: 'USD',
        status: 'AVAILABLE',
        type: 'APARTMENT'
    });

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [selectedPropertyId]);

    // --- Property Handlers ---

    const handleOpenPropertyModal = (property?: Property) => {
        if (property) {
            setEditingProperty(property);
            setPropertyForm(property);
        } else {
            setEditingProperty(null);
            setPropertyForm({
                type: 'PROJECT',
                transaction: 'SALE',
                currency: 'USD',
                status: 'AVAILABLE',
                isProject: true,
                images: []
            });
        }
        setIsPropertyModalOpen(true);
    };

        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const currentImagesCount = propertyForm.images?.length || 0;
            const MAX_IMAGES = 5;

            if (currentImagesCount + files.length > MAX_IMAGES) {
                alert(`Solo puedes subir un máximo de ${MAX_IMAGES} imágenes.`);
                return;
            }

            const processFile = (file: File): Promise<string> => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (readerEvent) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800; // Limit width to 800px
                            const scaleSize = MAX_WIDTH / img.width;
                            const width = scaleSize < 1 ? MAX_WIDTH : img.width;
                            const height = scaleSize < 1 ? img.height * scaleSize : img.height;
                            
                            canvas.width = width;
                            canvas.height = height;
                            
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            // Compress to JPEG 0.7 quality
                            resolve(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        img.src = readerEvent.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                });
            };

            const processedImages = await Promise.all(files.map(processFile));
            
            setPropertyForm(prev => ({
                ...prev,
                images: [...(prev.images || []), ...processedImages]
            }));
        }
    };

    const handleRemoveImage = (index: number) => {
        setPropertyForm(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index)
        }));
    };

    const handleSaveProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const propertyData = {
                ...propertyForm,
                isProject: propertyForm.type === 'PROJECT',
                images: propertyForm.images?.length ? propertyForm.images : ['https://via.placeholder.com/800x600?text=No+Image']
            };

            if (editingProperty) {
                await updateProperty.mutateAsync({ id: editingProperty.id, data: propertyData });
            } else {
                await createProperty.mutateAsync(propertyData);
            }
            toast.success(editingProperty ? 'Inmueble actualizado exitosamente' : 'Inmueble creado exitosamente');
            setIsPropertyModalOpen(false);
        } catch (error) {
            console.error('Error saving property:', error); alert('Error al guardar: Es posible que las imágenes sean muy pesadas o el almacenamiento estÃ lleno.');
        }
    };

    const handleDeleteClick = (property: Property) => {
        setPropertyToDelete(property);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!propertyToDelete) return;
        try {
            await deleteProperty.mutateAsync(propertyToDelete.id);
            if (selectedPropertyId === propertyToDelete.id) {
                setSelectedPropertyId(null);
            }
            toast.success('Inmueble eliminado exitosamente');
            setIsDeleteModalOpen(false);
            setPropertyToDelete(null);
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('OcurriÃ³ un error al eliminar el inmueble.');
        }
    };

    // --- Unit Handlers ---

    const handleOpenUnitModal = (unit?: PropertyUnit) => {
        if (unit) {
            setEditingUnit(unit);
            setUnitForm(unit);
        } else {
            setEditingUnit(null);
            setUnitForm({
                propertyId: selectedPropertyId!,
                currency: 'USD',
                status: 'AVAILABLE',
                type: 'APARTMENT'
            });
        }
        setIsUnitModalOpen(true);
    };

    const handleSaveUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUnit) {
                await updateUnit.mutateAsync({ id: editingUnit.id, data: unitForm });
            } else {
                await createUnit.mutateAsync(unitForm as Omit<PropertyUnit, 'id'>);
            }
            toast.success(editingUnit ? 'Unidad actualizada exitosamente' : 'Unidad creada exitosamente');
            setIsUnitModalOpen(false);
        } catch (error) {
            toast.error('Error al guardar la unidad');
            console.error('Error saving unit:', error);
        }
    };

    const getTransactionLabel = (type: TransactionType) => {
        switch (type) {
            case 'SALE': return 'Venta';
            case 'PRE_SALE': return 'Preventa';
            case 'RENT': return 'Alquiler';
            case 'ANTICRETIC': return 'Anticrético';
            default: return type;
        }
    };
    const getPropertyTypeLabel = (type: PropertyType) => {
        const types: Record<string, string> = {
            PROJECT: 'Proyecto',
            HOUSE: 'Casa',
            APARTMENT: 'Departamento',
            LAND: 'Terreno',
            OFFICE: 'Oficina',
            COMMERCIAL: 'Local Comercial',
            WAREHOUSE: 'Galpón'
        };
        return types[type] || type;
    };

    const getStatusLabel = (status: PropertyStatus) => {
        const statuses: Record<string, string> = {
            AVAILABLE: 'Disponible',
            RESERVED: 'Reservado',
            SOLD: 'Vendido'
        };
        return statuses[status] || status;
    };

    if (loading) return <div className="p-8 text-center">Cargando inmuebles...</div>;

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    const filteredUnits = selectedProperty && selectedProperty.isProject
        ? units.filter(u => u.propertyId === selectedProperty.id)
        : [];

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">

            {/* Sidebar List */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[var(--text-main)]">Inmuebles</h2>
                    <button onClick={() => handleOpenPropertyModal()} className="btn btn-primary btn-sm gap-1">
                        <Plus size={16} /> Nuevo
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {properties.map(property => (
                        <div
                            key={property.id}
                            onClick={() => setSelectedPropertyId(property.id)}
                            className={`card p-3 cursor-pointer transition-all hover:shadow-md border-l-4 ${selectedPropertyId === property.id
                                ? 'border-l-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                                : 'border-l-transparent'
                                }`}
                        >
                            <div className="flex gap-3">
                                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                    <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{property.name}</h3>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{property.zone || property.address}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase font-semibold">
                                            {getPropertyTypeLabel(property.type)}
                                        </span>
                                        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 uppercase font-semibold">
                                            {getTransactionLabel(property.transaction)}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${property.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' :
                                            property.status === 'SOLD' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {getStatusLabel(property.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Detail View */}
            <div className="flex-1 card overflow-hidden flex flex-col">
                {selectedProperty ? (
                    <>
                        {/* Property Header */}
                        <div className="relative h-48 sm:h-64 bg-gray-100">
                            <img src={selectedProperty.images[0]} alt={selectedProperty.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                                {getTransactionLabel(selectedProperty.transaction)}
                                            </span>
                                            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                                {getPropertyTypeLabel(selectedProperty.type)}
                                            </span>
                                        </div>
                                        <h1 className="text-3xl font-bold mb-1">{selectedProperty.name}</h1>
                                        <div className="flex items-center gap-2 text-sm opacity-90">
                                            <MapPin size={16} />
                                            {selectedProperty.address} {selectedProperty.zone && `(${selectedProperty.zone})`}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenPropertyModal(selectedProperty)}
                                            className="btn bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm gap-2"
                                        >
                                            <Edit size={16} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(selectedProperty)}
                                            className="btn bg-red-500/80 hover:bg-red-600/90 text-white border-none backdrop-blur-sm gap-2"
                                        >
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Details */}
                                                {/* Thumbnail Strip */}
                        {selectedProperty.images && selectedProperty.images.length > 1 && (
                            <div className="bg-white border-b border-gray-200 p-2 flex gap-2 overflow-x-auto relative z-10">
                                {selectedProperty.images.map((img, idx) => (
                                    <button type="button" key={idx} onClick={() => { console.log("Set active:", idx); setActiveImageIndex(idx); }}
                                        className={`relative w-20 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                                            activeImageIndex === idx 
                                            ? 'border-black ring-1 ring-black/10' 
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Left: Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    

                                    {/* Units Section (Only for Projects) */}
                                    {selectedProperty.isProject && (
                                        <div className="mt-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold">Unidades Disponibles</h3>
                                                <button onClick={() => handleOpenUnitModal()} className="btn btn-sm btn-outline gap-1">
                                                    <Plus size={14} /> Agregar Unidad
                                                </button>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-gray-50 border-b border-[var(--border-color)]">
                                                        <tr>
                                                            <th className="p-3 font-semibold">Unidad</th>
                                                            <th className="p-3 font-semibold">Tipo</th>
                                                            <th className="p-3 font-semibold">Piso</th>
                                                            <th className="p-3 font-semibold">Area</th>
                                                            <th className="p-3 font-semibold">Hab.</th>
                                                            <th className="p-3 font-semibold">Precio</th>
                                                            <th className="p-3 font-semibold">Estado</th>
                                                            <th className="p-3"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[var(--border-light)]">
                                                        {filteredUnits.map(unit => (
                                                            <tr key={unit.id} className="hover:bg-gray-50">
                                                                <td className="p-3 font-bold">{unit.name}</td>
                                                                <td className="p-3 text-xs uppercase">{unit.type}</td>
                                                                <td className="p-3">{unit.floor}</td>
                                                                <td className="p-3">{unit.area} m²</td>
                                                                <td className="p-3">{unit.bedrooms}</td>
                                                                <td className="p-3 font-medium text-[var(--color-success)]">
                                                                    {unit.price.toLocaleString()} {unit.currency}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                        unit.status === 'SOLD' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                                        }`}>
                                                                        {unit.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-right">
                                                                    <button onClick={() => handleOpenUnitModal(unit)} className="text-[var(--text-muted)] hover:text-[var(--color-secondary)]">
                                                                        <Edit size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Price & Contact */}
                                <div className="space-y-6">
                                    {!selectedProperty.isProject && (
                                        <div className="card bg-gray-50 border-[var(--border-color)]">
                                            <div className="card-body">
                                                <div className="text-sm text-[var(--text-muted)] uppercase font-bold mb-1">Precio de {getTransactionLabel(selectedProperty.transaction)}</div>
                                                <div className="text-3xl font-bold text-[var(--color-success)]">
                                                    {selectedProperty.price.toLocaleString()} {selectedProperty.currency}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="card border-[var(--border-color)]">
                                        <div className="card-body space-y-4">
                                            <h4 className="font-bold border-b border-[var(--border-light)] pb-2">UbicaciÃ³n</h4>
                                            <div className="text-sm space-y-2">
                                                <p><span className="font-semibold">Zona:</span> {selectedProperty.zone || '-'}</p>
                                                <p><span className="font-semibold">Dirección:</span> {selectedProperty.address}</p>
                                                {selectedProperty.mapUrl && (
                                                    <a href={selectedProperty.mapUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-secondary)] hover:underline flex items-center gap-1 mt-2">
                                                        <MapPin size={14} /> Ver en Mapa
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    {/* New Fields - Contact Information */}
                                    {(selectedProperty.advisorId || selectedProperty.phone) && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">InformaciÃ³n de Contacto</h4>
                                                <div className="text-sm space-y-2">
                                                    {selectedProperty.advisorId && (
                                                        <p><span className="font-semibold">Asesor:</span> {advisors.find(a => a.id === selectedProperty.advisorId)?.name || selectedProperty.advisorId}</p>
                                                    )}
                                                    {selectedProperty.phone && (
                                                        <p><span className="font-semibold">TelÃ©fono:</span> {selectedProperty.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Fields - Delivery & Availability */}
                                    {(selectedProperty.deliveryDate || selectedProperty.availability) && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">Entrega y Disponibilidad</h4>
                                                <div className="text-sm space-y-2">
                                                    {selectedProperty.deliveryDate && (
                                                        <p><span className="font-semibold">Fecha de Entrega:</span> {new Date(selectedProperty.deliveryDate).toLocaleDateString('es-ES')}</p>
                                                    )}
                                                    {selectedProperty.availability && (
                                                        <p><span className="font-semibold">Disponibilidad:</span> {selectedProperty.availability}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Fields - Pricing Details */}
                                    {(selectedProperty.pricePerSqmFrom || selectedProperty.pricePerSqmTo || selectedProperty.exchangeRate) && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">InformaciÃ³n Financiera</h4>
                                                <div className="text-sm space-y-2">
                                                    {(selectedProperty.pricePerSqmFrom || selectedProperty.pricePerSqmTo) && (
                                                        <p>
                                                            <span className="font-semibold">Precio por m²:</span> 
                                                            {selectedProperty.pricePerSqmFrom && ` ${selectedProperty.pricePerSqmFrom.toLocaleString()}`}
                                                            {selectedProperty.pricePerSqmFrom && selectedProperty.pricePerSqmTo && ' - '}
                                                            {selectedProperty.pricePerSqmTo && `${selectedProperty.pricePerSqmTo.toLocaleString()}`}
                                                        </p>
                                                    )}
                                                    {selectedProperty.exchangeRate && (
                                                        <p><span className="font-semibold">Tipo de Cambio:</span> Bs. {selectedProperty.exchangeRate}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Fields - Payment Methods */}
                                    {selectedProperty.paymentMethods && selectedProperty.paymentMethods.length > 0 && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">Formas de Pago</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProperty.paymentMethods.map((method, idx) => (
                                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                                            {method}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Fields - Equipment */}
                                    {selectedProperty.equipment && selectedProperty.equipment.length > 0 && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">Equipamiento</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProperty.equipment.map((item, idx) => (
                                                        <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Fields - Amenities */}
                                    {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                                        <div className="card border-[var(--border-color)]">
                                            <div className="card-body space-y-4">
                                                <h4 className="font-bold border-b border-[var(--border-light)] pb-2">Amenidades</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProperty.amenities.map((amenity, idx) => (
                                                        <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                                                            {amenity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] flex-col gap-4">
                        <Building2 size={48} className="opacity-20" />
                        <p>Selecciona un inmueble para ver los detalles</p>
                    </div>
                )}
            </div>
            {/* --- MODALS --- */}

            {/* Property Modal */}
            <Modal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
                title={editingProperty ? 'Editar Inmueble' : 'Nuevo Inmueble'}
                size="lg"
            >
                <form onSubmit={handleSaveProperty} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Nombre del Inmueble *</label>
                            <input
                                type="text"
                                required
                                value={propertyForm.name || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, name: e.target.value })}
                                className="w-full"
                                placeholder="Ej: Torres Evolution"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Tipo *</label>
                            <select
                                value={propertyForm.type}
                                onChange={e => setPropertyForm({ ...propertyForm, type: e.target.value as PropertyType })}
                                className="w-full"
                            >
                                <option value="PROJECT">Proyecto</option>
                                <option value="HOUSE">Casa</option>
                                <option value="APARTMENT">Departamento</option>
                                <option value="LAND">Terreno</option>
                                <option value="OFFICE">Oficina</option>
                                <option value="COMMERCIAL">Local Comercial</option>
                                <option value="WAREHOUSE">GalpÃ³n</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">transacción *</label>
                            <select
                                value={propertyForm.transaction}
                                onChange={e => setPropertyForm({ ...propertyForm, transaction: e.target.value as TransactionType })}
                                className="w-full"
                            >
                                <option value="SALE">Venta</option>
                                <option value="PRE_SALE">Preventa</option>
                                <option value="RENT">Alquiler</option>
                                <option value="ANTICRETIC">Anticrético</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Estado *</label>
                            <select
                                value={propertyForm.status}
                                onChange={e => setPropertyForm({ ...propertyForm, status: e.target.value as PropertyStatus })}
                                className="w-full"
                            >
                                <option value="AVAILABLE">Disponible</option>
                                <option value="RESERVED">Reservado</option>
                                <option value="SOLD">Vendido</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">DescripciÃ³n Corta</label>
                            <input
                                type="text"
                                value={propertyForm.description || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, description: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">DescripciÃ³n Larga</label>
                            <textarea
                                value={propertyForm.longDescription || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, longDescription: e.target.value })}
                                className="w-full h-20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Zona</label>
                            <input
                                type="text"
                                value={propertyForm.zone || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, zone: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Dirección</label>
                            <input
                                type="text"
                                value={propertyForm.address || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, address: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">URL Mapa</label>
                            <input
                                type="text"
                                value={propertyForm.mapUrl || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, mapUrl: e.target.value })}
                                className="w-full"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Sup. Terreno (m²)</label>
                            <input
                                type="number"
                                value={propertyForm.landArea || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, landArea: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Sup. Construida (m²)</label>
                            <input
                                type="number"
                                value={propertyForm.builtArea || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, builtArea: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        {propertyForm.type !== 'PROJECT' && propertyForm.type !== 'LAND' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Dormitorios</label>
                                    <select
                                        value={propertyForm.bedrooms || ''}
                                        onChange={e => setPropertyForm({ ...propertyForm, bedrooms: e.target.value as BedroomCount })}
                                        className="w-full"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Monoambiente">Monoambiente</option>
                                        <option value="1 dormitorio">1 dormitorio</option>
                                        <option value="2 dormitorios">2 dormitorios</option>
                                        <option value="3 dormitorios">3 dormitorios</option>
                                        <option value="+4 dormitorios">+4 dormitorios</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Baños</label>
                                    <input
                                        type="number"
                                        value={propertyForm.bathrooms || ''}
                                        onChange={e => setPropertyForm({ ...propertyForm, bathrooms: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Garajes</label>
                                    <input
                                        type="number"
                                        value={propertyForm.garages || ''}
                                        onChange={e => setPropertyForm({ ...propertyForm, garages: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}

                        {propertyForm.type !== 'PROJECT' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Precio</label>
                                    <input
                                        type="number"
                                        value={propertyForm.price || ''}
                                        onChange={e => setPropertyForm({ ...propertyForm, price: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Moneda</label>
                                    <select
                                        value={propertyForm.currency}
                                        onChange={e => setPropertyForm({ ...propertyForm, currency: e.target.value as Currency })}
                                        className="w-full"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="BOB">BOB</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {/* New Fields - Phase 1 */}
                        <div className="col-span-2 border-t border-[var(--border-light)] pt-4 mt-2">
                            <h4 className="text-sm font-bold text-[var(--text-main)] mb-3 uppercase">InformaciÃ³n Adicional</h4>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Asesor Responsable</label>
                            <select
                                value={propertyForm.advisorId || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, advisorId: e.target.value })}
                                className="w-full"
                            >
                                <option value="">Seleccionar...</option>
                                {advisors.map(advisor => (
                                    <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">TelÃ©fono de Contacto</label>
                            <input
                                type="tel"
                                value={propertyForm.phone || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, phone: e.target.value })}
                                className="w-full"
                                placeholder="+591 12345678"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Fecha de Entrega</label>
                            <input
                                type="date"
                                value={propertyForm.deliveryDate || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, deliveryDate: e.target.value })}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Disponibilidad</label>
                            <input
                                type="text"
                                value={propertyForm.availability || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, availability: e.target.value })}
                                className="w-full"
                                placeholder="Ej: Inmediata, En construcciÃ³n"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Precio m² Desde ($)</label>
                            <input
                                type="number"
                                value={propertyForm.pricePerSqmFrom || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, pricePerSqmFrom: Number(e.target.value) })}
                                className="w-full"
                                placeholder="1500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Precio m² Hasta ($)</label>
                            <input
                                type="number"
                                value={propertyForm.pricePerSqmTo || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, pricePerSqmTo: Number(e.target.value) })}
                                className="w-full"
                                placeholder="2500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Tipo de Cambio</label>
                            <input
                                type="number"
                                step="0.01"
                                value={propertyForm.exchangeRate || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, exchangeRate: Number(e.target.value) })}
                                className="w-full"
                                placeholder="6.96"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Formas de Pago</label>
                            <input
                                type="text"
                                value={propertyForm.paymentMethods?.join(', ') || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, paymentMethods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full"
                                placeholder="Contado, CrÃ©dito bancario, Financiamiento directo"
                            />
                            <span className="text-xs text-[var(--text-muted)]">Separar con comas</span>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Equipamiento</label>
                            <input
                                type="text"
                                value={propertyForm.equipment?.join(', ') || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full"
                                placeholder="Cocina, Closets, Aire acondicionado"
                            />
                            <span className="text-xs text-[var(--text-muted)]">Separar con comas</span>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Amenidades</label>
                            <input
                                type="text"
                                value={propertyForm.amenities?.join(', ') || ''}
                                onChange={e => setPropertyForm({ ...propertyForm, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full"
                                placeholder="Piscina, Gimnasio, Ãrea de juegos, Salón de eventos"
                            />
                            <span className="text-xs text-[var(--text-muted)]">Separar con comas</span>
                        </div>



                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">imágenes</label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
                                        <Upload size={16} />
                                        Subir imágenes
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {propertyForm.images?.length || 0} imágenes seleccionadas
                                    </span>
                                </div>

                                {propertyForm.images && propertyForm.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {propertyForm.images.map((img, index) => (
                                            <div key={index} className="relative group aspect-square bg-gray-100 rounded overflow-hidden border border-[var(--border-light)]">
                                                <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
                        <button
                            type="button"
                            onClick={() => setIsPropertyModalOpen(false)}
                            className="btn btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success gap-2"
                        >
                            <Edit size={16} />
                            Guardar Inmueble
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Unit Modal */}
            <Modal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                title={editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
            >
                <form onSubmit={handleSaveUnit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Nombre / N° Unidad</label>
                            <input
                                type="text"
                                required
                                value={unitForm.name || ''}
                                onChange={e => setUnitForm({ ...unitForm, name: e.target.value })}
                                className="w-full"
                                placeholder="Ej: 4A, Torre 1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Tipo</label>
                            <select
                                value={unitForm.type}
                                onChange={e => setUnitForm({ ...unitForm, type: e.target.value as any })}
                                className="w-full"
                            >
                                <option value="APARTMENT">Departamento</option>
                                <option value="OFFICE">Oficina</option>
                                <option value="COMMERCIAL">Local Comercial</option>
                                <option value="WAREHOUSE">GalpÃ³n</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Piso</label>
                            <input
                                type="text"
                                value={unitForm.floor || ''}
                                onChange={e => setUnitForm({ ...unitForm, floor: e.target.value })}
                                className="w-full"
                                placeholder="Ej: 4"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Area (m²)</label>
                            <input
                                type="number"
                                value={unitForm.area || ''}
                                onChange={e => setUnitForm({ ...unitForm, area: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Dormitorios</label>
                            <select
                                value={unitForm.bedrooms || ''}
                                onChange={e => setUnitForm({ ...unitForm, bedrooms: e.target.value as BedroomCount })}
                                className="w-full"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Monoambiente">Monoambiente</option>
                                <option value="1 dormitorio">1 dormitorio</option>
                                <option value="2 dormitorios">2 dormitorios</option>
                                <option value="3 dormitorios">3 dormitorios</option>
                                <option value="+4 dormitorios">+4 dormitorios</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Baños</label>
                            <input
                                type="number"
                                value={unitForm.bathrooms || ''}
                                onChange={e => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Precio</label>
                            <input
                                type="number"
                                value={unitForm.price || ''}
                                onChange={e => setUnitForm({ ...unitForm, price: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Moneda</label>
                            <select
                                value={unitForm.currency}
                                onChange={e => setUnitForm({ ...unitForm, currency: e.target.value as Currency })}
                                className="w-full"
                            >
                                <option value="USD">USD</option>
                                <option value="BOB">BOB</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-[var(--text-main)] mb-1 uppercase">Estado</label>
                            <select
                                value={unitForm.status}
                                onChange={e => setUnitForm({ ...unitForm, status: e.target.value as PropertyStatus })}
                                className="w-full"
                            >
                                <option value="AVAILABLE">Disponible</option>
                                <option value="RESERVED">Reservado</option>
                                <option value="SOLD">Vendido</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-light)]">
                        <button
                            type="button"
                            onClick={() => setIsUnitModalOpen(false)}
                            className="btn btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success gap-2"
                        >
                            <Edit size={16} />
                            Guardar Unidad
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Eliminación"
                size="sm"
            >
                <div className="space-y-4 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">¿Estás seguro?</h4>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Estás a punto de eliminar el inmueble "{propertyToDelete?.name}". Esta acciÃ³n no se puede deshacer.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="btn btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                        >
                            Sí­, Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default Inmuebles;



