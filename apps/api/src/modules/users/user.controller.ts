import {
	Controller,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	Request,
	DefaultValuePipe,
	ParseIntPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * Get all users (paginated, for admin)
	 */
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
		@Query("search") search?: string
	) {
		return await this.userService.findAllPaginated(page, limit, search);
	}

	/**
	 * Get current authenticated user
	 */
	@UseGuards(JwtAuthGuard)
	@Get("me")
	async getMe(@Request() req: { user: { id: string } }) {
		return await this.userService.findByIdSafe(req.user.id);
	}

	/**
	 * Get user by ID
	 */
	@UseGuards(JwtAuthGuard)
	@Get(":id")
	async getById(@Param("id") id: string) {
		return await this.userService.findByIdSafe(id);
	}

	/**
	 * Update user
	 */
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	async update(
		@Param("id") id: string,
		@Body()
		body: Partial<{
			email: string;
			username: string;
			avatarUrl: string | null;
			xp: number;
			streak: number;
			interests: string[];
		}>
	) {
		return await this.userService.update(id, body);
	}

	/**
	 * Delete user
	 */
	@UseGuards(JwtAuthGuard)
	@Delete(":id")
	async delete(@Param("id") id: string) {
		await this.userService.delete(id);
		return { success: true };
	}
}
