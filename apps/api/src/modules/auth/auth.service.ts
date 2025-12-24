import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UserService } from "../users/user.service";
import { User } from "../users/user.entity";

export interface JwtPayload {
	sub: string;
	email: string;
}

export interface AuthResponse {
	accessToken: string;
	user: Omit<User, "passwordHash">;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async signup(data: {
		email: string;
		username: string;
		password: string;
		interests?: string[];
	}): Promise<AuthResponse> {
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

		// Return without passwordHash
		const { passwordHash: _, ...userWithoutPassword } = user;

		return {
			accessToken,
			user: userWithoutPassword,
		};
	}

	async login(email: string, password: string): Promise<AuthResponse> {
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

		// Return without passwordHash
		const { passwordHash: _, ...userWithoutPassword } = user;

		return {
			accessToken,
			user: userWithoutPassword,
		};
	}

	async validateUser(userId: string): Promise<User | null> {
		return await this.userService.findById(userId);
	}

	private generateToken(user: User): string {
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
		};
		return this.jwtService.sign(payload);
	}
}
