import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { InteractionsModule } from './interactions/interactions.module';
import { UnitsModule } from './units/units.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule, 
    PrismaModule, 
    AuthModule, 
    LeadsModule, 
    InteractionsModule,
    UnitsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
