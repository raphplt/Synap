import { Public } from "../auth/decorators/public.decorator";
import { Controller, Post } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller("seed")
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Public()
	@Post("admin")
	async seedAdminUser() {
		return await this.seedService.seedAdminUser();
	}

	@Public()
	@Post("all")
	async seedAll() {
		return await this.seedService.seedAll();
	}
}
