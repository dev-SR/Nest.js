import { PropertyType } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	isEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	ValidateNested
} from 'class-validator';

export class HomeResponseDto {
	id: string;
	address: string;
	@Exclude()
	number_of_bedrooms: number;
	@Exclude()
	number_of_bathrooms: number;

	@Expose({ name: 'numberOfBedrooms' })
	numberOfBedrooms() {
		return this.number_of_bedrooms;
	}

	@Expose({ name: 'numberOfBathrooms' })
	numberOfBathrooms() {
		return this.number_of_bathrooms;
	}
	city: string;

	@Exclude()
	listed_date: Date;

	@Expose({ name: 'listedDate' })
	listedDate() {
		return this.listed_date;
	}
	price: number;

	@Exclude()
	land_size: number;
	@Expose({ name: 'landSize' })
	landSize() {
		return this.land_size;
	}

	propertyType: PropertyType;

	@Exclude()
	realtor_id: string;

	images: { url: string }[];

	constructor(partial: Partial<HomeResponseDto>) {
		Object.assign(this, partial);
	}
}

export class CreateHomeDto {
	@IsString()
	@IsNotEmpty()
	address: string;

	@IsNumber()
	@IsPositive()
	number_of_bedrooms: number;
	@IsNumber()
	@IsPositive()
	number_of_bathrooms: number;
	@IsString()
	@IsNotEmpty()
	city: string;
	@IsNumber()
	@IsPositive()
	price: number;
	@IsNumber()
	@IsPositive()
	land_size: number;
	@IsEnum(PropertyType)
	propertyType: PropertyType;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ImageUrl)
	images: ImageUrl[];
}

class ImageUrl {
	// here annotating is important
	/*
	Why: without any annotation `images` will be empty because of
	`whitelist: true` ->images: [ ImageUrl {} ]
	*/
	@IsString()
	@IsNotEmpty()
	url: string;
}

export class UpdateHomeDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	address?: string;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	number_of_bedrooms?: number;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	number_of_bathrooms?: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	city?: string;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	price?: number;

	@IsOptional()
	@IsNumber()
	@IsPositive()
	land_size?: number;

	@IsOptional()
	@IsEnum(PropertyType)
	propertyType: PropertyType;
}
