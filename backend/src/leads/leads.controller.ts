import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('leads')
@UseGuards(AuthGuard('jwt'))
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    async create(@Body() createLeadDto: CreateLeadDto) {
        try {
            console.log('Creating lead with data:', JSON.stringify(createLeadDto, null, 2));
            const result = await this.leadsService.create(createLeadDto);
            console.log('Lead created successfully:', result.id);
            return result;
        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.leadsService.findAll(pageNum, limitNum);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
        try {
            console.log(`Updating lead ${id} with data:`, JSON.stringify(updateLeadDto, null, 2));
            const result = await this.leadsService.update(id, updateLeadDto);
            console.log('Lead updated successfully');
            return result;
        } catch (error) {
            console.error('Error updating lead:', error);
            throw error;
        }
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.leadsService.remove(id);
    }


    @Post(':id/interests')
    addInterest(@Param('id') leadId: string, @Body() interestData: { propertyId: string; notes?: string }) {
        return this.leadsService.addInterest(leadId, interestData);
    }

}
