// src/services/mockData.ts
import type { Lead, Interaction, Property, Advisor, PropertyUnit } from '../types';

// Simple UUID generator for mock data
const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Seed advisors
export const advisors: Advisor[] = [
  {
    id: 'adv-1',
    name: 'Ana Gómez',
    email: 'ana.gomez@example.com',
    phone: '+591 700 123456',
    active: true,
    photo: undefined,
    office: 'La Paz',
  },
  {
    id: 'adv-2',
    name: 'Luis Pérez',
    email: 'luis.perez@example.com',
    phone: '+591 700 654321',
    active: true,
    photo: undefined,
    office: 'Santa Cruz',
  },
  {
      id: 'adv-3',
      name: 'Maria Rodriguez',
      email: 'maria@c21.com',
      phone: '+591 700 00003',
      active: true,
      office: 'Cochabamba'
  }
];

// Seed properties
export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Residencial Sierra Verde',
    type: 'PROJECT',
    transaction: 'SALE',
    isProject: true,
    description: 'Proyecto de viviendas en zona alta de La Paz',
    address: 'Calle Falsa 123, La Paz',
    price: 120000,
    currency: 'USD',
    status: 'AVAILABLE',
    images: [],
    advisorId: 'adv-1',
  },
  {
      id: 'prop-2',
      name: 'Torre Empresarial Equipetrol',
      type: 'OFFICE',
      transaction: 'RENT',
      isProject: false,
      description: 'Oficinas corporativas de lujo',
      address: 'Av. San Martin, Santa Cruz',
      price: 1500,
      currency: 'USD',
      status: 'AVAILABLE',
      images: [],
      advisorId: 'adv-2'
  }
];

// Seed units (mockUnits) - Added to fix export error
export const mockUnits: PropertyUnit[] = [
    {
        id: 'unit-1',
        propertyId: 'prop-1',
        name: 'Apt 101',
        type: 'APARTMENT',
        price: 120000,
        currency: 'USD',
        status: 'AVAILABLE',
        bedrooms: '2 dormitorios',
        bathrooms: 2,
        area: 95
    },
    {
        id: 'unit-2',
        propertyId: 'prop-1',
        name: 'Apt 102',
        type: 'APARTMENT',
        price: 125000,
        currency: 'USD',
        status: 'RESERVED',
        bedrooms: '3 dormitorios',
        bathrooms: 2,
        area: 110
    }
];

// Empty collections for leads and interactions  will be populated via LeadService logic or local storage
export const leads: Lead[] = [];
export const interactions: Interaction[] = [];

// Export aliases for backward compatibility if needed
export const mockAdvisors = advisors;
export const mockProperties = properties;
export const mockLeads = leads;
export const mockInteractions = interactions;

export const seedData = {
  advisors,
  properties,
  leads,
  interactions,
  units: mockUnits
};
