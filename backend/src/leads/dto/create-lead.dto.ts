export class CreateLeadDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    source?: string;
    city?: string;
    country?: string;
    budget?: string;
    preferredZone?: string;
    timing?: string;
    stage?: any;
    temperature?: any;
    advisorId?: string;
}