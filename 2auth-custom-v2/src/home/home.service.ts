import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { filter } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';

interface GetHomesParam {
	city?: string;
	price?: {
		gte?: number;
		lte?: number;
	};
	propertyType?: PropertyType;
}

interface CrateHomeParam {
	address: string;
	number_of_bedrooms: number;
	number_of_bathrooms: number;
	city: string;
	price: number;
	land_size: number;
	propertyType: PropertyType;
	images: { url: string }[];
}

interface UpdateHomeParam {
	address?: string;
	number_of_bedrooms?: number;
	number_of_bathrooms?: number;
	city?: string;
	price?: number;
	land_size?: number;
	propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
	constructor(private readonly prismaService: PrismaService) {}

	async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
		const homes = await this.prismaService.home.findMany({
			include: {
				images: {
					select: {
						url: true
					}
				}
			},
			where: filter
		});
		if (!homes.length) throw new NotFoundException();

		return homes.map((home) => new HomeResponseDto(home));
	}

	async getHomeById(id: string) {
		const home = await this.prismaService.home.findUnique({
			where: {
				id
			}
		});

		if (!home) throw new NotFoundException();

		return new HomeResponseDto(home);
	}

	async createHome({
		address,
		number_of_bedrooms,
		number_of_bathrooms,
		city,
		price,
		land_size,
		propertyType,
		images
	}: CrateHomeParam) {
		// create home
		const home = await this.prismaService.home.create({
			data: {
				address,
				number_of_bedrooms,
				number_of_bathrooms,
				city,
				price,
				land_size,
				propertyType,
				realtor_id: 'b9448cba-a240-447f-897a-22f0f4557a42'
			}
		});

		// create images for this home
		const home_images = images.map((image) => {
			return { ...image, home_id: home.id };
		});
		await this.prismaService.imageUrl.createMany({ data: home_images });

		return new HomeResponseDto(home);
	}

	async updateHomeById(id: string, data: UpdateHomeParam) {
		const home = await this.prismaService.home.findUnique({
			where: { id }
		});

		if (!home) throw new NotFoundException();

		const updatedHome = await this.prismaService.home.update({
			where: {
				id
			},
			data
		});

		return new HomeResponseDto(updatedHome);
	}

	async deleteHome(id: string) {
		try {
			const count = await this.prismaService.imageUrl.deleteMany({
				where: {
					home_id: id
				}
			});
			// console.log(count);

			const deletedHome = await this.prismaService.home.delete({
				where: {
					id
				}
			});
			return { message: `${id} deleted ` };
		} catch {
			return new BadRequestException();
		}
	}
}
