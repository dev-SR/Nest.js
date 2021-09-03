import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import CategoriesService from './categories.service';
import CreateCategoryDto from './dto/createCategory.dto';
import UpdateCategoryDto from './dto/updateCategory.dto';

@Controller('categories')
export default class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  getCategoryById(@Param() { id }: { id: string }) {
    console.log(id);
    return this.categoriesService.getCategoryById(Number(id));
  }

  @Post()
  async createCategory(@Body() category: CreateCategoryDto) {
    return this.categoriesService.createCategory(category);
  }

  @Patch(':id')
  async updateCategory(
    @Param() { id }: { id: string },
    @Body() category: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(Number(id), category);
  }

  @Delete(':id')
  async deleteCategory(@Param() { id }: { id: string }) {
    return this.categoriesService.deleteCategory(Number(id));
  }
}
