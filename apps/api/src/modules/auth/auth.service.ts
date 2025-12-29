import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UserService } from "../users/user.service";
import { type User } from "../users/user.entity";
import { ResponseMapper } from "../../common/mappers/response.mapper";
import {
	type AuthResponseDto,
	type UserResponseDto,
} from "../../common/dto/response.dto";

export interface JwtPayload {
	sub: string
	email: string
}

@Injectable()
export class AuthService {
	constructor (
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async signup (data: {
		email: string
		username: string
		password: string
		interests?: string[]
	}): Promise<AuthResponseDto> {
		// Hash password with Argon2
		const passwordHash = await argon2.hash(data.password);

		// Create user
		const user = await this.userService.create({
			email: data.email,
			username: data.username,
			passwordHash,
			interests: data.interests,
		});

		// Generate JWT
		const accessToken = this.generateToken(user);

		return {
			accessToken,
			user: ResponseMapper.toUserDto(user),
		};
	}

	async login (email: string, password: string): Promise<AuthResponseDto> {
		// Find user by email
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException("INVALID_CREDENTIALS");
		}

		// Verify password
		const isValid = await argon2.verify(user.passwordHash, password);
		if (!isValid) {
			throw new UnauthorizedException("INVALID_CREDENTIALS");
		}

		// Update last activity
		await this.userService.updateLastActivity(user.id);

		// Generate JWT
		const accessToken = this.generateToken(user);

		return {
			accessToken,
			user: ResponseMapper.toUserDto(user),
		};
	}

	async validateUser (userId: string): Promise<User | null> {
		return await this.userService.findById(userId);
	}

	async validateUserDto (userId: string): Promise<UserResponseDto | null> {
		const user = await this.userService.findById(userId);
		return user ? ResponseMapper.toUserDto(user) : null;
	}

	private generateToken (user: User): string {
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
		};
		return this.jwtService.sign(payload);
	}
}
