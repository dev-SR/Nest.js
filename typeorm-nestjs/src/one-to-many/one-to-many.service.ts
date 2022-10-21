import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  getConnection,
  getRepository,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Photo } from './models/photo.entity';
import { User } from './models/users.entity';

@Injectable()
export class OneToManyService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  private readonly logger = new Logger(OneToManyService.name);

  async createUser(data): Promise<User> {
    return this.userRepository.save(data);
  }

  async findOneUser(condition): Promise<User> {
    return this.userRepository.findOne(condition);
  }

  // import { DeleteResult} from 'typeorm';
  async deleteUser(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  async getAllUserOnly(): Promise<User[]> {
    // return await this.userRepository.find();
    // return await this.userRepository.createQueryBuilder('u').getMany();
    return await this.userRepository
      .createQueryBuilder('u')
      .select('u.email', 'Email')
      .addSelect('u.id', 'ID')
      .getRawMany();
  }

  async getAllUserWithPhotos(): Promise<User[]> {
    /*
    return await this.userRepository.find({
      relations: ['photos'],
      select: ['email'],
    });
    return getRepository(User).find({ relations: ['photos'] });
    */

    const q = this.userRepository // Or, getRepository( User )
      .createQueryBuilder('u') //alias
      .leftJoinAndSelect('u.photos', 'p') //(relation,alias,condition?)
      .select(['u.email', 'p.url']);
    return await q.getMany();
    /*
    SELECT 'u.email', 'p.url'
    FROM "user" "u"
    LEFT JOIN "photo" "p" ON "p"."userId"="u"."id"
    */
  }

  async getOneUserWithPhotos(id: number): Promise<User | NotFoundException> {
    /*     const u1 = await this.userRepository.findOne(id, {
      relations: ['photos'],
      select: ['email'],
    });
    if (!u1) throw new NotFoundException(`User ${id} Not Found`);

    return u1; */

    /*     try {
      const p = await this.userRepository.findOneOrFail(id, {
        relations: ['photos'],
      });
      return p;
    } catch (e) {
      return new NotFoundException(`User ${id} Not Found`);
    } */

    const u = await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.photos', 'p')
      .select(['u.email', 'p.url'])
      .where('u.id = :id', { id })
      // .where('u.id IN (:...id)', { id: [id] })
      .getOne();
    if (!u) throw new NotFoundException(`User ${id} Not Found`);

    return u;

    /*
    SELECT ..
    FROM "user" "u"
    LEFT JOIN "photo" "p" ON "p"."userId"="u"."id" WHERE "u"."id" IN ($1)
    */
  }

  // !PHOTO
  async createPhoto(data: Photo, email: string): Promise<any> {
    // const newPhoto = await this.photoRepository.create({ ...data, user: user });
    const user = await this.findOneUser({ email });
    if (!user) {
      throw new NotFoundException();
    }
    const newPhoto = new Photo();
    newPhoto.url = data.url;
    newPhoto.user = user; //!

    return await this.photoRepository.save(newPhoto);
  }

  async getAllPhotoOnly(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }

  async getAllPhotoWithTheirUser(): Promise<Photo[]> {
    // return await this.photoRepository.find({ relations: ['user'] });
    const q = this.photoRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u');
    return q.getMany();
  }

  async getOnePhotoWithTheirUser(id: number): Promise<Photo> {
    // return await this.photoRepository.findOne( id, { relations: ['user'] } );
    try {
      const p = await this.photoRepository.findOneOrFail(id, {
        relations: ['user'],
      });
      return p;
    } catch (e) {
      return e;
    }
    /*

    SELECT
    FROM "photo" "p"
    LEFT JOIN "user" "u" ON "u"."id"="p"."userId"
    WHERE "Photo"."id" IN (1)
    */
  }

  async updatePhoto(data: Photo, id: number): Promise<any> {
    await this.photoRepository.update(id, data);
    return await this.photoRepository.findOne(id);
  }
}
