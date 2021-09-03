import { Injectable } from '@nestjs/common';
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

  async getOneUserWithPhotos(id: number): Promise<User> {
    // return await this.userRepository.findOne(id, {
    //   relations: ['photos'],
    //   select: ['email'],
    // });
    return await this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.photos', 'p')
      .select(['u.email', 'p.url'])
      .where('u.id = :id', { id })
      // .where('u.id IN (:...id)', { id: [id] })
      .getOne();
    /*
    (mapToProperty: string, subQueryFactory: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>, alias: string, condition?: string, parameters?: ObjectLiteral)


    SELECT ..
      FROM "user" "u"
      LEFT JOIN "photo" "p" ON "p"."userId"="u"."id" WHERE "u"."id" IN ($1)
      */
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
    return await this.photoRepository.findOne(id, { relations: ['user'] });
    /*

    SELECT  "Photo"."id" AS "Photo_id",
            "Photo"."url" AS "Photo_url",
            "Photo"."userId" AS "Photo_userId",
            "Photo__user"."id" AS "Photo__user_id",
            "Photo__user"."email" AS "Photo__user_email",
            "Photo__user"."password" AS "Photo__user_password"
    FROM "photo" "Photo"
    LEFT JOIN "user" "Photo__user" ON "Photo__user"."id"="Photo"."userId"
    WHERE "Photo"."id" IN (1)
    */
  }

  async createPhoto(data: Photo, user: User): Promise<any> {
    // const newPhoto = await this.photoRepository.create({ ...data, user: user });

    const newPhoto = new Photo();
    newPhoto.url = data.url;
    newPhoto.user = user;

    return await this.photoRepository.save(newPhoto);
  }

  async updatePhoto(data: Photo, id: number): Promise<any> {
    await this.photoRepository.update(id, data);
    return await this.photoRepository.findOne(id);
  }
}
