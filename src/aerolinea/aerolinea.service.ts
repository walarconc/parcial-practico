import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { Logger } from '@nestjs/common';

@Injectable()
export class AerolineaService {
        constructor(
        @InjectRepository(AerolineaEntity)
        private readonly aerolineaRepository: Repository<AerolineaEntity>
    ){}

    async findAll(): Promise<AerolineaEntity[]> {
        return await this.aerolineaRepository.find();
    }

    async findOne(id: string): Promise<AerolineaEntity> {
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id} } );
        if (!aerolinea)
          throw new BusinessLogicException("La aerolinea con el id dado no fue encontrada", BusinessError.NOT_FOUND);
   
        return aerolinea;
    }

    async create(aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
        const ahora = new Date();
        const fechaFundacion = new Date(aerolinea.fecha_fundacion);
          if (fechaFundacion >= ahora) {
            throw new BusinessLogicException('La fecha de fundacion debe ser una fecha en el pasado', BusinessError.PRECONDITION_FAILED);
        }
        return await this.aerolineaRepository.save(aerolinea);
    }

    async update(id: string, aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
        const aerolineaPersisitida: AerolineaEntity = await this.aerolineaRepository.findOne({where:{id}});
        if (!aerolineaPersisitida)
          throw new BusinessLogicException("La aerolinea con el id dado no fue encontrada", BusinessError.NOT_FOUND);                

        const ahora = new Date();
        const fechaFundacion = new Date(aerolinea.fecha_fundacion);        
        if (fechaFundacion >= ahora) {
            throw new BusinessLogicException('La fecha de fundacion debe ser una fecha en el pasado', BusinessError.PRECONDITION_FAILED);
        }
        return await this.aerolineaRepository.save({...aerolineaPersisitida, ...aerolinea});
    }

    async delete(id: string) {
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where:{id}});
        if (!aerolinea)
          throw new BusinessLogicException("La aerolinea con el id dado no fue encontrada", BusinessError.NOT_FOUND);
     
        await this.aerolineaRepository.remove(aerolinea);
    }
}
