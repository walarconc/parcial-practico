import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaService } from './aerolinea.service';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AerolineaService', () => {

  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;
  let aerolineasList: AerolineaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(getRepositoryToken(AerolineaEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    aerolineasList = [];
    for (let i = 0; i < 5; i++) {
      const aerolinea: AerolineaEntity = await repository.save({
        nombre: faker.company.name(),
        descripcion: faker.lorem.sentence(),
        fecha_fundacion: faker.date.past(),
        pagina_web: faker.internet.url()
      })
      aerolineasList.push(aerolinea);
    }
  }

  it('Deberia estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll deberia retornar todas las aerolineas', async () => {
    const aerolineas: AerolineaEntity[] = await service.findAll();
    expect(aerolineas).not.toBeNull();
    expect(aerolineas).toHaveLength(aerolineasList.length);
  });

  it('findOne deberia retornar una aerolinea por el id', async () => {
    const aerolineaAlmacenada: AerolineaEntity = aerolineasList[0];
    const aerolinea: AerolineaEntity = await service.findOne(aerolineaAlmacenada.id);
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.nombre).toEqual(aerolineaAlmacenada.nombre)
  });

  it('findOne deberia lanzar una exepcion para una arolinea invalida', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada")
  });

  it('create deberia retornar una nueva aerolinea', async () => {
    const aerolinea: AerolineaEntity = {
      id: "",
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      pagina_web: faker.internet.url(),
      aeropuertos: [],
    }

    const nuevaAerolinea: AerolineaEntity = await service.create(aerolinea);
    expect(nuevaAerolinea).not.toBeNull();

    const aerolineaAlmacenada: AerolineaEntity = await repository.findOne({ where: { id: nuevaAerolinea.id } })
    expect(aerolineaAlmacenada).not.toBeNull();
    expect(aerolineaAlmacenada.nombre).toEqual(nuevaAerolinea.nombre)
  });

  it('update deberia modificar una aerolinea', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea.nombre = "New name";

    const aerolineaActualizada: AerolineaEntity = await service.update(aerolinea.id, aerolinea);
    expect(aerolineaActualizada).not.toBeNull();

    const aerolineaAlmacenada: AerolineaEntity = await repository.findOne({ where: { id: aerolinea.id } })
    expect(aerolineaAlmacenada).not.toBeNull();
    expect(aerolineaAlmacenada.nombre).toEqual(aerolinea.nombre)
  });

  it('update deberia lanzar una exepcion para una arolinea invalida', async () => {
    let aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea = {
      ...aerolinea, nombre: "New aerolinea name"
    }
    await expect(() => service.update("0", aerolinea)).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada")
  });

  it('delete deberia eliminar una aerolinea', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);

    const aerolineaEliminada: AerolineaEntity = await repository.findOne({ where: { id: aerolinea.id } })
    expect(aerolineaEliminada).toBeNull();
  });

  it('delete deberia lanzar una exepcion para una arolinea invalida', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada")
  });
});
