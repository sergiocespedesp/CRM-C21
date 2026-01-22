export type PipelineStage =
    | 'NEW'
    | 'INFO_SENT'
    | 'CONTACTED'
    | 'QUALIFIED'
    | 'PRESENTATION'
    | 'VISIT'
    | 'NEGOTIATION'
    | 'OTHER_REQUIREMENT'
    | 'CLOSED_WON'
    | 'DISCARDED';

export type LeadTemperature = 'NONE' | 'COLD' | 'WARM' | 'HOT';

export type InteractionType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE' | 'VISIT' | 'NEXT_ACTION' | 'MESSENGER';

export type InteractionOrigin = 'META_ADS' | 'WHATSAPP_API' | 'MANUAL' | 'WEBSITE' | 'SYSTEM';

export type PropertyType = 'PROJECT' | 'HOUSE' | 'APARTMENT' | 'LAND' | 'OFFICE' | 'COMMERCIAL' | 'WAREHOUSE';

export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type TransactionType = 'SALE' | 'PRE_SALE' | 'RENT' | 'ANTICRETIC';

export type Currency = 'USD' | 'BOB';

export type BedroomCount = 'Monoambiente' | '1 dormitorio' | '2 dormitorios' | '3 dormitorios' | '+4 dormitorios';

export interface Advisor {
    id: string;
    name: string;
    email: string;
    phone: string;
    active: boolean;
    photo?: string;
    office?: string;
    role?: 'ADMIN' | 'ADVISOR';
}

export interface Interest {
    id: string;
    leadId: string;
    propertyId: string;
    unitId?: string;
    date: string;
    notes?: string;
}

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    country: string;
    source: string;
    sourceDetail?: string;
    advisorId: string;
    stage: PipelineStage;
    temperature: LeadTemperature;
    interests?: Interest[];
    interest?: string;
    nextActionDate?: string;
    nextAction?: string;
    internalNotes?: string;
    clientId?: string;
    
    // SPRINT 1: Qualification fields
    budget?: 'under_50k' | '50k_100k' | '100k_200k' | '200k_500k' | 'over_500k';
    preferredZone?: string;
    timing?: 'immediate' | '1_3_months' | '3_6_months' | 'exploring';
    
    // SPRINT 3: Referral tracking
    referredBy?: string;
    referralSource?: 'client' | 'advisor' | 'partner' | 'other';
    referralNotes?: string;
    isReferral?: boolean;
    
    createdAt: string;
    updatedAt: string;
    interactions?: Interaction[];
}

// SPRINT 3: Visit checklist data structure
export interface VisitChecklist {
    propertyId: string;
    propertyName: string;
    visitDate: string;
    clientInterest: 'high' | 'medium' | 'low' | 'none';
    clientAttended: boolean;
    objections: string[];
    customObjections?: string;
    positiveReactions: string[];
    nextSteps: string;
    estimatedClosingDate?: string;
    notes?: string;
}

export interface Interaction {
    id: string;
    leadId: string;
    type: InteractionType;
    origin: InteractionOrigin;
    content: string;
    date: string;
    advisorId: string;
    notes?: string;
    details?: any;
    visitChecklist?: VisitChecklist;
}

export interface Property {
    id: string;
    name: string;
    type: PropertyType;
    transaction: TransactionType;
    isProject: boolean;
    description: string;
    longDescription?: string;
    zone?: string;
    address: string;
    mapUrl?: string;
    latitude?: number;
    longitude?: number;
    landArea?: number;
    builtArea?: number;
    bedrooms?: BedroomCount;
    bathrooms?: number;
    garages?: number;
    price: number;
    currency: Currency;
    status: PropertyStatus;
    images: string[];

    advisorId?: string;
    phone?: string;
    deliveryDate?: string;
    pricePerSqmFrom?: number;
    pricePerSqmTo?: number;
    exchangeRate?: number;
    availability?: string;
    paymentMethods?: string[];
    equipment?: string[];
    amenities?: string[];

    unitsTotal?: number;
    unitsAvailable?: number;
    units?: PropertyUnit[];
}

export interface PropertyUnit {
    id: string;
    propertyId: string;
    name: string;
    type: 'APARTMENT' | 'HOUSE' | 'LOT' | 'OFFICE' | 'COMMERCIAL' | 'WAREHOUSE';
    price: number;
    currency: Currency;
    status: PropertyStatus;

    floor?: string;
    area?: number;
    bedrooms?: BedroomCount;
    bathrooms?: number;
    features?: string[];
}

export interface AgendaEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    type?: string;
    leadId?: string;
    description?: string;
    color?: string;
}

export interface AgendaItem {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: InteractionType | 'TASK' | 'NEXT_ACTION';
    leadName?: string;
    leadId?: string;
    description?: string;
    color?: string;
}