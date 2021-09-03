import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => User, (user) => user.photos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;
  /**
   * !NOTE: as Photo is the many side ...
   * !typeorm will generate a foreign_key `userId`  referencing the user id.
   *
   * *onDelete: "RESTRICT"|"CASCADE"|"SET NULL" - specifies how foreign key
   * *should behave when referenced object is deleted
   *
   * ?For cascading to work in OnetoMany, Photo entity must have "onDelete/onUpdate"
   * property  which is set to "NO ACTION" by default
   */
}
