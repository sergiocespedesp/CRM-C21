import { Role } from '@prisma/client';

export class CreateUserDto {
    email: string;
    name: string;
    password?: string;
    role?: Role;
    active?: boolean;
    phone?: string;
}
