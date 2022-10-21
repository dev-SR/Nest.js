import { ConflictException, HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface SignUpParams {
	name: string;
	email: string;
	phone: string;
	password: string;
}

interface SignInParams {
	email: string;
	password: string;
}

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly prismaService: PrismaService) {}

	async getUsers() {
		const users: User[] = await this.prismaService.user.findMany();
		this.logger.log({ users });
		return users;
	}

	async signup({ email, password, phone, name }: SignUpParams) {
		// 2. Check User Exits?
		const userExits: User | null = await this.prismaService.user.findUnique({
			where: {
				email: email
			}
		});

		if (userExits) {
			throw new ConflictException();
		}

		// 3. Hash Password
		const hashedPassword = await bcrypt.hash(password, 10);

		this.logger.log({ hashedPassword });

		// 4. Store user in db
		const user = await this.prismaService.user.create({
			data: {
				email,
				name,
				phone,
				password: hashedPassword,
				// user_type: 'BUYER'
				user_type: UserType.BUYER
			}
		});

		// 5. return token
		// this.logger.log({ env: process.env.JWT_TOKEN });
		return this.generateJWT(email, user.id);
	}

	async signin({ email, password }: SignInParams) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email
			}
		});

		if (!user) {
			throw new HttpException('Invalid credentials', 400);
		}

		const hashedPassword = user.password;
		const isValidPassword = await bcrypt.compare(password, hashedPassword);

		if (!isValidPassword) {
			throw new HttpException('Invalid credentials', 400);
		}

		return this.generateJWT(email, user.id);
	}

	private generateJWT(email: string, id: string) {
		return jwt.sign({ email, id }, process.env.JWT_TOKEN, {
			expiresIn: 3600000
		});
	}
}
