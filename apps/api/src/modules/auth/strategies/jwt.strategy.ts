import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService, JwtPayload } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,
		configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey:
				configService.get<string>("JWT_SECRET") ??
				"synap-dev-secret-change-in-production",
		});
	}

	async validate(payload: JwtPayload): Promise<{ id: string; email: string }> {
		const user = await this.authService.validateUser(payload.sub);
		if (!user) {
			throw new UnauthorizedException("USER_NOT_FOUND");
		}

		return {
			id: user.id,
			email: user.email,
		};
	}
}
