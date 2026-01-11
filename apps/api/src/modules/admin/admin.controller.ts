import { Controller, Delete, Get, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	/**
	 * GET /admin/stats
	 * Get dashboard statistics
	 */
	@Get("stats")
	async getStats() {
		return await this.adminService.getStats();
	}

	/**
	 * DELETE /admin/cards
	 * Clear all cards from the database
	 */
	@Delete("cards")
	@HttpCode(HttpStatus.OK)
	async clearAllCards() {
		const result = await this.adminService.clearAllCards();
		return {
			success: true,
			message: `${result.deleted} cartes supprimées`,
			...result,
		};
	}

	/**
	 * DELETE /admin/reset
	 * Reset entire database (keeping admin user)
	 */
	@Delete("reset")
	@HttpCode(HttpStatus.OK)
	async resetDatabase(@Request() req: { user: { email: string } }) {
		const result = await this.adminService.resetDatabase(req.user.email);
		return {
			success: true,
			message: "Base de données réinitialisée",
			...result,
		};
	}
}
