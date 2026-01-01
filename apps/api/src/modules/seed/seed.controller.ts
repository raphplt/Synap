import { Public } from "../auth/decorators/public.decorator";
import { Controller, Post } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller("seed")
export class SeedController {
	constructor (private readonly seedService: SeedService) {}

	@Public()
	@Post("gold")
	async seedGoldDataset () {
		return await this.seedService.seedGoldDataset();
	}

	@Public()
	@Post("admin")
	async seedAdminUser () {
		return await this.seedService.seedAdminUser();
	}

	@Public()
	@Post("atlas")
	async seedAtlas () {
		return await this.seedService.seedAtlas();
	}

	@Public()
	@Post("atlas-full")
	async seedAtlasFull () {
		return await this.seedService.seedAtlasFull();
	}

	@Public()
	@Post("all")
	async seedAll () {
		return await this.seedService.seedAll();
	}
}
