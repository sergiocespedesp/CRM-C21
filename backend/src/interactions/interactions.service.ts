import { Injectable } from '@nestjs/common';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  create(createInteractionDto: CreateInteractionDto) {
    return this.prisma.interaction.create({
      data: createInteractionDto as any,
    });
  }

  findAll() {
    return this.prisma.interaction.findMany({
      include: { lead: true, advisor: true },
      orderBy: { date: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.interaction.findUnique({
      where: { id },
    });
  }

  update(id: string, updateInteractionDto: UpdateInteractionDto) {
    return this.prisma.interaction.update({
      where: { id },
      data: updateInteractionDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.interaction.delete({
      where: { id },
    });
  }
}
