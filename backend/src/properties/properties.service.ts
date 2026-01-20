import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
    constructor(private prisma: PrismaService) { }

    create(data: any) {
        return this.prisma.property.create({ data });
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
