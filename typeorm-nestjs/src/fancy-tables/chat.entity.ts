import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserTest } from './user.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => UserTest, (user: UserTest) => user.chats)
  public from_user: UserTest;

  @ManyToOne(() => UserTest, (user: UserTest) => user.chats)
  public to_user: UserTest;
}
