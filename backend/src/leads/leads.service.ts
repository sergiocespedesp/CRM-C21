import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    create(createLeadDto: CreateLeadDto) {
        // Remove undefined fields to avoid Prisma errors
        const cleanData = Object.fromEntries(
            Object.entries(createLeadDto).filter(([_, v]) => v !== undefined)
        );
        console.log('Clean data for Prisma:', cleanData);
        return this.prisma.lead.create({
            data: cleanData as any,
        });
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
    }

    findOne(id: string) {
        return this.prisma.lead.findUnique({
            where: { id },
            include: { advisor: true, interactions: true, interests: true }
        });
    }

    async update(id: string, updateLeadDto: UpdateLeadDto) {
        // Define allowed fields to avoid Prisma errors with unknown fields from frontend
        const allowedFields = [
            'firstName', 'lastName', 'email', 'phone', 'source', 
            'temperature', 'stage', 'advisorId', 'nextAction', 
            'nextActionDate', 'budget', 'city', 'preferredZone', 
            'timing', 'country'
        ];

        const cleanData: any = {};
        Object.entries(updateLeadDto).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value !== undefined) {
                cleanData[key] = value;
            }
        });

        console.log(`[LeadsService] Clean update data for lead ${id}:`, JSON.stringify(cleanData, null, 2));

        return this.prisma.lead.update({
            where: { id },
            data: cleanData,
        });
    }

    remove(id: string) {
        return this.prisma.lead.delete({
            where: { id },
        });
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
