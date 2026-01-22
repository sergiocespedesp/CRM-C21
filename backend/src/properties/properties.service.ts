import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
    private readonly logger = new Logger(PropertiesService.name);

    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        try {
            this.logger.log('Creating property with data:', JSON.stringify(data));
            return await this.prisma.property.create({ data });
        } catch (error) {
            this.logger.error('Error creating property:', error);
            throw error;
        }
    }

    async createBulk(properties: any[]) {
        const created: any[] = [];
        for (const prop of properties) {
            const result = await this.prisma.property.create({ data: prop });
            created.push(result);
        }
        return created;
    }

    findAll() {
        return this.prisma.property.findMany({
            include: { units: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    findOne(id: string) {
        return this.prisma.property.findUnique({ 
            where: { id },
            include: { units: true }
        });
    }

    update(id: string, data: any) {
        return this.prisma.property.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.property.delete({ where: { id } });
    }
}
