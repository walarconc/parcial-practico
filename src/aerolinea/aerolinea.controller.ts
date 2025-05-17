import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { AerolineaService } from './aerolinea.service';
import { plainToInstance } from 'class-transformer';
import { AerolineaDto } from './aerolinea.dto';
import { AerolineaEntity } from './aerolinea.entity';
import { Logger } from '@nestjs/common';

@Controller('airlines')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaController {
     constructor(private readonly aerolineaService: AerolineaService) {}

    @Get()
    async findAll() {
      return await this.aerolineaService.findAll();
    }
     
    @Get(':aerolineaId')
    async findOne(@Param('aerolineaId') aerolineaId: string) {
      Logger.log('Este es un log simple', aerolineaId);
     return await this.aerolineaService.findOne(aerolineaId);
    }

    @Post()
    async create(@Body() aerolineaDto: AerolineaDto) {
        const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
        return await this.aerolineaService.create(aerolinea);
    }

    @Put(':aerolineaId')
    async update(@Param('aerolineaId') aerolineaId: string, @Body() aerolineaDto: AerolineaDto) {
        const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
        return await this.aerolineaService.update(aerolineaId, aerolinea);
    }

    @Delete(':aerolineaId')
    @HttpCode(204)
    async delete(@Param('aerolineaId') aerolineaId: string) {
        return await this.aerolineaService.delete(aerolineaId);
    }
}
