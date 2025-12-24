import { Controller, Post } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { Public } from "../auth/decorators/public.decorator";

@Controller("seed")
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Public()
	@Post("gold")
	async seedGoldDataset() {
		return await this.seedService.seedGoldDataset();
	}

	@Public()
	@Post("admin")
	async seedAdminUser() {
		return await this.seedService.seedAdminUser();
	}

	@Public()
	@Post("atlas")
	async seedAtlas() {
		return await this.seedService.seedAtlas();
	}
}
