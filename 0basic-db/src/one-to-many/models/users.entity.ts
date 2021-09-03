import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Photo, (photo) => photo.user, { cascade: true })
  //
  photos: Photo[];
  /**
   * !Notice that the User table has no `photos` field. Again, this is expected as
   * !the one-to-many relationship is captured in the `userId` field in the Photo
   * !table.
   *
   * cascade: boolean | ("insert" | "update")[] - If set to true, the related object
   * will be inserted and updated in the database. You can also specify an array of
   * cascade options.
   */
}
