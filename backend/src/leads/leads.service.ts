import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { 

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}

    create(createLeadDto: CreateLeadDto) {
        return this.prisma.lead.create({
            data: createLeadDto as any,
        });
    

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}

    async findAll(page: number = 1, limit: number = 50) {
        const skip = (page - 1) * limit;

        const [leads, total] = await Promise.all([
            this.prisma.lead.findMany({
                include: { advisor: true, interests: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.lead.count(),
        ]);

        return {
            data: leads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}

    findOne(id: string) {
        return this.prisma.lead.findUnique({
            where: { id },
            include: { advisor: true, interactions: true 

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}
        });
    

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}

    update(id: string, updateLeadDto: UpdateLeadDto) {
        return this.prisma.lead.update({
            where: { id },
            data: updateLeadDto as any,
        });
    

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}

    remove(id: string) {
        return this.prisma.lead.delete({
            where: { id },
        });
    

    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}


    async addInterest(leadId: string, interestData: { propertyId: string; notes?: string }) {
        return this.prisma.interest.create({
            data: {
                leadId,
                propertyId: interestData.propertyId,
                notes: interestData.notes,
            },
        });
    }

}
