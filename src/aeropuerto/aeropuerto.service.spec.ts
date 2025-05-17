import { Test, TestingModule } from '@nestjs/testing';
import { AeropuertoService } from './aeropuerto.service';
import { AeropuertoEntity } from './aeropuerto.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('AeropuertoService', () => {

  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(getRepositoryToken(AeropuertoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await repository.save({
        nombre: faker.company.name(),
        codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
        pais: faker.location.country(),
        ciudad: faker.internet.url(),
      })
      aeropuertosList.push(aeropuerto);
    }
  }

  it('Deberia estar definido', () => {
    expect(service).toBeDefined();
  });

  it('findAll deberia retornar todos las aeropuertos', async () => {
    const aeropuertos: AeropuertoEntity[] = await service.findAll();
    expect(aeropuertos).not.toBeNull();
    expect(aeropuertos).toHaveLength(aeropuertosList.length);
  });

  it('findOne deberia retornar un aeroperto por el id', async () => {
    const aeropuertoAlmacenado: AeropuertoEntity = aeropuertosList[0];
    const aeropuerto: AeropuertoEntity = await service.findOne(aeropuertoAlmacenado.id);
    expect(aeropuerto).not.toBeNull();
    expect(aeropuerto.nombre).toEqual(aeropuertoAlmacenado.nombre)
  });

  it('findOne deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado")
  });

  it('create deberia retornar un nuevo aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = {
      id: "",
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: [],
    }

    const nuevoAeropuerto: AeropuertoEntity = await service.create(aeropuerto);
    expect(nuevoAeropuerto).not.toBeNull();

    const aeropuertoAlmacenado: AeropuertoEntity = await repository.findOne({ where: { id: nuevoAeropuerto.id } })
    expect(aeropuertoAlmacenado).not.toBeNull();
    expect(aeropuertoAlmacenado.nombre).toEqual(nuevoAeropuerto.nombre)
  });

  it('update deberia modificar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto.nombre = "New name";

    const aeropuertoActualizado: AeropuertoEntity = await service.update(aeropuerto.id, aeropuerto);
    expect(aeropuertoActualizado).not.toBeNull();

    const aeropuertoAlmacenado: AeropuertoEntity = await repository.findOne({ where: { id: aeropuerto.id } })
    expect(aeropuertoAlmacenado).not.toBeNull();
    expect(aeropuertoAlmacenado.nombre).toEqual(aeropuerto.nombre)
  });

  it('update deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    let aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto = {
      ...aeropuerto, nombre: "New aeropuerto name"
    }
    await expect(() => service.update("0", aeropuerto)).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado")
  });

  it('delete deberia eliminar un aeropuerto', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.delete(aeropuerto.id);

    const aeropuertoEliminado: AeropuertoEntity = await repository.findOne({ where: { id: aeropuerto.id } })
    expect(aeropuertoEliminado).toBeNull();
  });

  it('delete deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.delete(aeropuerto.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado")
  });
});
