import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';
import { Repository } from 'typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('AerolineaAeropuertoService', () => {

  let service: AerolineaAeropuertoService;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolinea: AerolineaEntity;
  let aeropuertosList: AeropuertoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaAeropuertoService],
    }).compile();

    service = module.get<AerolineaAeropuertoService>(AerolineaAeropuertoService);
    aerolineaRepository = module.get<Repository<AerolineaEntity>>(getRepositoryToken(AerolineaEntity));
    aeropuertoRepository = module.get<Repository<AeropuertoEntity>>(getRepositoryToken(AeropuertoEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    aerolineaRepository.clear();
    aeropuertoRepository.clear();

    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
        nombre: faker.company.name(),
        codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
        pais: faker.location.country(),
        ciudad: faker.internet.url()
      })
      aeropuertosList.push(aeropuerto);
    }

    aerolinea = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      pagina_web: faker.internet.url(),
      aeropuertos: aeropuertosList
    })
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addAirportToAirline deberia agregar un aeropuerto a una aerolinea', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    const nuevaAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      pagina_web: faker.internet.url(),
    })

    const result: AerolineaEntity = await service.addAirportToAirline(nuevaAerolinea.id, aeropuertoNuevo.id);

    expect(result.aeropuertos.length).toBe(1);
    expect(result.aeropuertos[0]).not.toBeNull();
    expect(result.aeropuertos[0].nombre).toBe(aeropuertoNuevo.nombre)
    expect(result.aeropuertos[0].ciudad).toBe(aeropuertoNuevo.ciudad)
  });

  it('addAirportToAirline deberia lanzar una expecion para un aeropuerto invalido', async () => {
    const nuevaAerolinea: AerolineaEntity = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fecha_fundacion: faker.date.past(),
      pagina_web: faker.internet.url(),
    })

    await expect(() => service.addAirportToAirline(nuevaAerolinea.id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado");
  });

  it('addAirportToAirline deberia lanzar una expecion para una aerolinea invalida', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    await expect(() => service.addAirportToAirline("0", aeropuertoNuevo.id)).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada");
  });

  it('findAirportFromAirline deberia retornar un aeropuerto dada una aerolinea', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    const aeropuertoAlmacenado: AeropuertoEntity = await service.findAirportFromAirline(aerolinea.id, aeropuerto.id)
    expect(aeropuertoAlmacenado).not.toBeNull();
    expect(aeropuertoAlmacenado.nombre).toBe(aeropuerto.nombre);
    expect(aeropuertoAlmacenado.codigo).toBe(aeropuerto.codigo);
  });

  it('findAirportFromAirline deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    await expect(() => service.findAirportFromAirline(aerolinea.id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado");
  });

  it('findAirportFromAirline deberia lanzar una exepcion para una aerolinea invalida', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await expect(() => service.findAirportFromAirline("0", aeropuerto.id)).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada");
  });

  it('findAirportFromAirline deberia lanzar una excepcion para un aeropuerto que no esta asociado a una aerolinea', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    await expect(() => service.findAirportFromAirline(aerolinea.id, aeropuertoNuevo.id)).rejects.toHaveProperty("message", "El aeropuerto con el id dado no esta asociado a la aerolinea");
  });

  it('findAirportsFromAirline deberia retornar un aeropuerto dada una aeroliena', async () => {
    const aeropuertos: AeropuertoEntity[] = await service.findAirportsFromAirline(aerolinea.id);
    expect(aeropuertos.length).toBe(5)
  });

  it('findAirportsFromAirline deberia lanzar una expecion dada un aerolinea invalida', async () => {
    await expect(() => service.findAirportsFromAirline("0")).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada");
  });

  it('updateAirportsFromAirline deberia actualizar una lista de aeropuertos a una aerolinea', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    const aerolineaActializada: AerolineaEntity = await service.updateAirportsFromAirline(aerolinea.id, [aeropuertoNuevo]);
    expect(aerolineaActializada.aeropuertos.length).toBe(1);

    expect(aerolineaActializada.aeropuertos[0].nombre).toBe(aeropuertoNuevo.nombre);
    expect(aerolineaActializada.aeropuertos[0].ciudad).toBe(aeropuertoNuevo.ciudad);
  });

  it('updateAirportsFromAirline deberia lanzar una expecion dada un aerolinea invalida', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    await expect(() => service.updateAirportsFromAirline("0", [aeropuertoNuevo])).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada");
  });

  it('updateAirportsFromAirline deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    const aeropuertoNuevo: AeropuertoEntity = aeropuertosList[0];
    aeropuertoNuevo.id = "0";

    await expect(() => service.updateAirportsFromAirline(aerolinea.id, [aeropuertoNuevo])).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado");
  });

  it('deleteAirportFromAirline deberia remover un aeropuerto de una aerolinea', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.deleteAirportFromAirline(aerolinea.id, aeropuerto.id);
    const aerolineaAlmacenada: AerolineaEntity = await aerolineaRepository.findOne({ where: { id: aerolinea.id }, relations: ["aeropuertos"] });
    const aeropuertoEliminado: AeropuertoEntity = aerolineaAlmacenada.aeropuertos.find(a => a.id === aeropuerto.id);

    expect(aeropuertoEliminado).toBeUndefined();

  });

  it('deleteAirportFromAirline deberia lanzar una exepcion para un aeropuerto invalido', async () => {
    await expect(() => service.deleteAirportFromAirline(aerolinea.id, "0")).rejects.toHaveProperty("message", "El aeropuerto con el id dado no fue encontrado");
  });

  it('deleteAirportFromAirline deberia lanzar una expecion dada un aerolinea invalida', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await expect(() => service.deleteAirportFromAirline("0", aeropuerto.id)).rejects.toHaveProperty("message", "La aerolinea con el id dado no fue encontrada");
  });

  it('deleteAProductTocultura deberia lanzar una excepcion para un aeropuerto que no esta asociado a una aerolinea', async () => {
    const aeropuertoNuevo: AeropuertoEntity = await aeropuertoRepository.save({
      nombre: faker.company.name(),
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.internet.url(),
      aerolineas: []
    });

    await expect(() => service.deleteAirportFromAirline(aerolinea.id, aeropuertoNuevo.id)).rejects.toHaveProperty("message", "El aeropuerto con el id dado no esta asociado con la aerolinea");
  });
});
