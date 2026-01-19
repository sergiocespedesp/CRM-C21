
import type { InteractionOrigin } from '../types';

export interface ExternalLeadPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string;
    message?: string;
    origin: InteractionOrigin;
    needsId?: string; // e.g. Facebook Form ID
}

export const IntegrationService = {
    // Simulate incoming webhook from Facebook Ads
    generateMockFacebookLead: (): ExternalLeadPayload => {
        const id = Math.floor(Math.random() * 1000);
        return {
            firstName: `FbUser${id}`,
            lastName: `Test`,
            email: `fb.user.${id}@example.com`,
            phone: `+591 700${id.toString().padStart(5, '0')}`,
            source: 'Facebook Ads',
            message: 'Me interesa saber el precio y ubicación exacta. Vi esto en Facebook.',
            origin: 'META_ADS',
            needsId: 'fb-form-123'
        };
    },

    // Simulate incoming webhook from Instagram Ads
    generateMockInstagramLead: (): ExternalLeadPayload => {
        const id = Math.floor(Math.random() * 1000);
        return {
            firstName: `IgUser${id}`,
            lastName: `Test`,
            email: `ig.user.${id}@example.com`,
            phone: `+591 711${id.toString().padStart(5, '0')}`,
            source: 'Instagram Ads',
            message: 'Info por favor. Vi la historia en Instagram.',
            origin: 'META_ADS',
            needsId: 'ig-form-456'
        };
    }
};
