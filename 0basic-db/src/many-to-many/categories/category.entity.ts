import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import Post from '../posts/post.entity';

@Entity()
class Category {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @ManyToMany(() => Post, (post: Post) => post.categories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  public posts: Post[];
}

export default Category;
