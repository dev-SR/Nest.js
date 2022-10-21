import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/user/decorator/roles.decorator';
import { User, UserInfo } from 'src/user/decorator/user.decorator';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
	constructor(private readonly homeService: HomeService) {}
	@Get()
	getHomes(
		@Query('city') city?: string,
		@Query('minPrice') minPrice?: string,
		@Query('maxPrice') maxPrice?: string,
		@Query('propertyType') propertyType?: PropertyType,
		@Query('arr') arr?
	): Promise<HomeResponseDto[]> {
		console.log({
			city,
			minPrice,
			maxPrice,
			propertyType,
			arr
		});

		const price =
			minPrice || maxPrice
				? {
						...(minPrice && { gte: parseFloat(minPrice) }),
						...(maxPrice && { lte: parseFloat(maxPrice) })
				  }
				: undefined;

		const filter = {
			...(city && { city }),
			...(price && { price }),
			...(propertyType && { propertyType })
		};

		return this.homeService.getHomes(filter);
	}

	@Get(':id')
	getHome(@Param('id') id: string) {
		return this.homeService.getHomeById(id);
	}

	@Roles(UserType.ADMIN, UserType.REALTOR)
	@Post()
	createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
		// return user;
		return this.homeService.createHome(body);
	}

	@Put(':id')
	updateHome(@Param('id') id: string, @Body() body: UpdateHomeDto) {
		return this.homeService.updateHomeById(id, body);
	}

	@Delete(':id')
	deleteHome(@Param('id') id: string) {
		return this.homeService.deleteHome(id);
	}
}
