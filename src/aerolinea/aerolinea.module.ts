import { Module } from '@nestjs/common';
import { AerolineaService } from './aerolinea.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { AerolineaController } from './aerolinea.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AerolineaEntity])],
  exports: [AerolineaService],
  providers: [AerolineaService],
  controllers: [AerolineaController],
})
export class AerolineaModule {}
