export class CreateInteractionDto {
    type: string;
    content: string;
    leadId: string;
    advisorId?: string;
    date?: Date;
}