import { User } from 'src/one-to-many/models/users.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Category from '../categories/category.entity';

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @ManyToOne(() => User, (author: User) => author.posts, {
    onDelete: 'CASCADE',
  })
  public author: User;

  @ManyToMany(() => Category, (category: Category) => category.posts)
  @JoinTable()
  public categories: Category[];
}

export default Post;

/**
 * @JoinTable() is required for @ManyToMany relations
 *
 * When we use the  @ManyToMany() and  @JoinTable() decorators, TypeORM set ups an
 * additional table. This way, neither the Post nor Category table stores the data
 * about the relationship.
 *
 * Relations can be uni-directional and bi-directional. Uni-directional relations
 * are relations with a relation decorator only on one side. Bi-directional
 * relations are relations with decorators on both sides of a relation.
 *
 * @ManyToMany(() => Category, (category: Category) => category.posts)
 * @JoinTable()
 * public categories: Category[];
 *
 * @ManyToMany(() => Post, (post: Post) => post.categories)
 * public posts: Post[]
 *
 */
