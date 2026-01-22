import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Sanitize input
    const { email, name, password, role, active, phone } = createUserDto;
    
    try {
        return await this.prisma.user.create({
          data: {
              email,
              name,
              password: password || '123456', 
              role, 
              active,
              phone
          } as any,
        });
    } catch (e) {
        throw new InternalServerErrorException(e.message);
    }
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
      const { email, name, password, role, active, phone } = updateUserDto;
      const data: any = { };
      if (email) data.email = email;
      if (name) data.name = name;
      if (role) data.role = role;
      if (active !== undefined) data.active = active;
      if (password) data.password = password;
      if (phone) data.phone = phone;

    console.log('Updating user', id, data);

    try {
        return await this.prisma.user.update({
          where: { id },
          data,
        });
    } catch (e) {
        console.error('Update error:', e);
        throw new InternalServerErrorException('Error updating user: ' + e.message);
    }
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
