import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Photo } from './models/photo.entity';
import { User } from './models/users.entity';
import { OneToManyService } from './one-to-many.service';

@Controller('one-to-many')
export class OneToManyController {
  constructor(private services: OneToManyService) {}
  @Post('/create-user')
  async createUser(@Body() body: any): Promise<User> {
    return await this.services.createUser({
      email: body.email,
      password: body.password,
    });
  }
  @Post('/create-photo')
  async createPhoto(@Body() body: any): Promise<Photo> {
    // const user = new User();
    //   user.email = 'soikat@gmail.com';

    return await this.services.createPhoto(
      {
        url: body.url,
      } as Photo,
      body.email,
    );
  }

  @Get('/all-user-only')
  async allUserOnly(): Promise<User[]> {
    return await this.services.getAllUserOnly();
  }

  @Get('/all-user-with-photos')
  async allUserWithPhotos(): Promise<User[]> {
    return await this.services.getAllUserWithPhotos();
  }

  @Get('/one-user-with-photos')
  async oneUserWithPhotos(
    @Query('id', ParseIntPipe) id: number,
  ): Promise<User | NotFoundException> {
    return await this.services.getOneUserWithPhotos(id);
  }

  @Get('/all-photo-only')
  async allPhotoOnly(): Promise<Photo[]> {
    return await this.services.getAllPhotoOnly();
  }

  @Get('/all-photo-with-user')
  async allPhoto(): Promise<Photo[]> {
    return await this.services.getAllPhotoWithTheirUser();
  }
  @Get('/one-photo-with-user')
  async onePhoto(@Query('id', ParseIntPipe) id: number): Promise<Photo> {
    return await this.services.getOnePhotoWithTheirUser(id);
  }

  @Delete('/delete-user')
  async deleteUser(@Query('id', ParseIntPipe) id: number) {
    return await this.services.deleteUser(id);
  }

  @Put('/update-photo')
  async updatePhoto(@Query('id', ParseIntPipe) id: number, @Body() body: any) {
    return await this.services.updatePhoto(body, id);
  }
}
