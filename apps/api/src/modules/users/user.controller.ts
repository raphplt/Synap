import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	async getMe(@Request() req: { user: { id: string } }) {
		const user = await this.userService.findById(req.user.id);
		if (!user) {
			return null;
		}

		// Return user without passwordHash
		const { passwordHash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}
}
