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
	constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

	async signup(data: {
		email: string;
		username: string;
		password: string;
		interests?: string[];
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

	async login(email: string, password: string): Promise<AuthResponseDto> {
		// Find user by email
		const user = await this.userService.findByEmail(email);
		if (!user) {
			throw new UnauthorizedException("INVALID_CREDENTIALS");
		}

		// OAuth users cannot login with password
		if (!user.passwordHash) {
			throw new UnauthorizedException("USE_OAUTH_LOGIN");
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

	async validateUser(userId: string): Promise<User | null> {
		return await this.userService.findById(userId);
	}

	async validateUserDto(userId: string): Promise<UserResponseDto | null> {
		const user = await this.userService.findById(userId);
		return user ? ResponseMapper.toUserDto(user) : null;
	}

	async oauthLogin(data: {
		provider: "google" | "apple";
		idToken: string;
		username?: string;
	}): Promise<AuthResponseDto> {
		// Verify token with provider
		const providerUser =
			data.provider === "google"
				? await this.verifyGoogleToken(data.idToken)
				: await this.verifyAppleToken(data.idToken);

		// Try to find existing user by provider ID
		let user = await this.userService.findByProviderAndId(data.provider, providerUser.sub);

		if (!user) {
			// Try to find by email (user may have signed up with email before)
			const existingEmailUser = await this.userService.findByEmail(providerUser.email);
			if (existingEmailUser) {
				// Link the OAuth provider to existing account
				throw new UnauthorizedException("EMAIL_ALREADY_REGISTERED_WITH_PASSWORD");
			}

			// Generate username if not provided
			const username =
				data.username ?? providerUser.email.split("@")[0] + Math.floor(Math.random() * 1000);

			// Create new user
			user = await this.userService.createOAuthUser({
				email: providerUser.email,
				username,
				authProvider: data.provider,
				authProviderId: providerUser.sub,
				avatarUrl: providerUser.picture,
			});
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

	private async verifyGoogleToken(idToken: string): Promise<{
		sub: string;
		email: string;
		name?: string;
		picture?: string;
	}> {
		// Verify token using Google's tokeninfo endpoint
		const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

		if (!response.ok) {
			throw new UnauthorizedException("INVALID_GOOGLE_TOKEN");
		}

		const payload = (await response.json()) as {
			sub: string;
			email: string;
			name?: string;
			picture?: string;
			aud: string;
		};

		// Verify the audience matches our client ID
		const googleClientId = process.env.GOOGLE_CLIENT_ID;
		if (googleClientId && payload.aud !== googleClientId) {
			throw new UnauthorizedException("INVALID_GOOGLE_TOKEN_AUDIENCE");
		}

		return {
			sub: payload.sub,
			email: payload.email,
			name: payload.name,
			picture: payload.picture,
		};
	}

	private async verifyAppleToken(idToken: string): Promise<{
		sub: string;
		email: string;
		name?: string;
		picture?: string;
	}> {
		// Apple ID tokens are JWTs that can be verified with Apple's public keys
		// For production, you should verify the signature with Apple's JWKS
		// For now, we decode and verify the claims
		try {
			const parts = idToken.split(".");
			if (parts.length !== 3) {
				throw new Error("Invalid token format");
			}

			const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
				sub: string;
				email: string;
				iss: string;
				aud: string;
				exp: number;
			};

			// Verify issuer
			if (payload.iss !== "https://appleid.apple.com") {
				throw new UnauthorizedException("INVALID_APPLE_TOKEN_ISSUER");
			}

			// Verify audience matches our client ID
			const appleClientId = process.env.APPLE_CLIENT_ID;
			if (appleClientId && payload.aud !== appleClientId) {
				throw new UnauthorizedException("INVALID_APPLE_TOKEN_AUDIENCE");
			}

			// Verify expiration
			if (payload.exp * 1000 < Date.now()) {
				throw new UnauthorizedException("APPLE_TOKEN_EXPIRED");
			}

			return {
				sub: payload.sub,
				email: payload.email,
				name: undefined, // Apple doesn't include name in token
				picture: undefined, // Apple doesn't provide profile pictures
			};
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			throw new UnauthorizedException("INVALID_APPLE_TOKEN");
		}
	}

	private generateToken(user: User): string {
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
		};
		return this.jwtService.sign(payload);
	}
}
