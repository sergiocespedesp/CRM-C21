import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
    constructor(private prisma: PrismaService) { }

    create(data: any) {
        return this.prisma.propertyUnit.create({ data });
    }

    findAll() {
        return this.prisma.propertyUnit.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    findOne(id: string) {
        return this.prisma.propertyUnit.findUnique({ where: { id } });
    }

    update(id: string, data: any) {
        return this.prisma.propertyUnit.update({ where: { id }, data });
    }

    remove(id: string) {
        return this.prisma.propertyUnit.delete({ where: { id } });
    }
}
