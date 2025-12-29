import {
	Controller,
	Post,
	Body,
	Get,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CreateUserDto, LoginDto } from "./dto/auth.dto";
import { Public } from "./decorators/public.decorator";
import { ResponseMapper } from "../../common/mappers/response.mapper";

@Controller("auth")
export class AuthController {
	constructor (private readonly authService: AuthService) {}

	@Public()
	@Post("signup")
	async signup (@Body() dto: CreateUserDto) {
		return await this.authService.signup({
			email: dto.email,
			username: dto.username,
			password: dto.password,
			interests: dto.interests,
		});
	}

	@Public()
	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login (@Body() dto: LoginDto) {
		return await this.authService.login(dto.email, dto.password);
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	async getMe (@Request() req: { user: { id: string, email: string } }) {
		const user = await this.authService.validateUser(req.user.id);
		if (!user) {
			return null;
		}
		return ResponseMapper.toUserDto(user);
	}
}
