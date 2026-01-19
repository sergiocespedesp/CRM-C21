import React, { useState } from 'react';
import { Plus, Edit, Mail, Phone, Save, Check } from 'lucide-react';
import type { Advisor } from '../types';
import { useAdvisors, useCreateAdvisor, useUpdateAdvisor } from '../hooks/useAdvisors';
import Modal from '../components/Modal';

const Advisors = () => {
    // React Query Hooks
    const { data: advisors = [], isLoading } = useAdvisors();
    const createAdvisor = useCreateAdvisor();
    const updateAdvisor = useUpdateAdvisor();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAdvisor, setCurrentAdvisor] = useState<Partial<Advisor>>({
        name: '', email: '', phone: '', active: true, role: 'ADVISOR'
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleOpenModal = (advisor?: Advisor) => {
        if (advisor) {
            setCurrentAdvisor({ ...advisor });
            setIsEditing(true);
        } else {
            setCurrentAdvisor({ name: '', email: '', phone: '', active: true, role: 'ADVISOR' });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentAdvisor.id) {
                await updateAdvisor.mutateAsync({
                    id: currentAdvisor.id,
                    data: currentAdvisor
                });
            } else {
                await createAdvisor.mutateAsync(currentAdvisor);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving advisor:', error);
            alert('Error al guardar asesor');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BEAF87]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asesores</h1>
                   <p className="text-gray-500 mt-1">Gestión del equipo de ventas</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary gap-2"
                >
                    <Plus size={18} />
                    Nuevo Asesor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advisors.map(advisor => (
                    <div key={advisor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                         <div className="w-20 h-20 bg-gradient-to-br from-[#BEAF87] to-[#A89770] rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-[#BEAF87]/10">
                            {advisor.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{advisor.name}</h3>
                        <p className="text-sm font-medium text-[#BEAF87] mb-4 bg-[#BEAF87]/10 px-3 py-1 rounded-full">
                            {advisor.role || 'Asesor Inmobiliario'}
                        </p>
                        
                        <div className="w-full space-y-3 mb-6">
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Mail size={16} />
                                <span className="text-sm">{advisor.email}</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <span className="text-sm">{advisor.phone}</span>
                            </div>
                        </div>

                        <div className="mt-auto flex gap-3 w-full">
                            <button 
                                onClick={() => handleOpenModal(advisor)}
                                className="flex-1 btn btn-outline gap-2 text-sm"
                            >
                                <Edit size={16} /> Editar
                            </button>
                             <div className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${advisor.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <div className={`w-2 h-2 rounded-full ${advisor.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                {advisor.active ? 'Activo' : 'Inactivo'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? 'Editar Asesor' : 'Nuevo Asesor'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={currentAdvisor.name}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="input"
                            value={currentAdvisor.email}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                            type="tel"
                            className="input"
                            value={currentAdvisor.phone}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select 
                            className="input"
                            value={currentAdvisor.role}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, role: e.target.value as 'ADMIN' | 'ADVISOR'})}
                        >
                            <option value="ADVISOR">Asesor</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            className="w-4 h-4 text-[#BEAF87] border-gray-300 rounded focus:ring-[#BEAF87]"
                            checked={currentAdvisor.active}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, active: e.target.checked})}
                        />
                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Asesor Activo</label>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary gap-2"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Advisors;
