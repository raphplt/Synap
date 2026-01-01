import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { SeedService } from "../modules/seed/seed.service";

async function bootstrap () {
	const app = await NestFactory.createApplicationContext(AppModule, {
		logger: ["error", "warn", "log", "debug"],
	});

	try {
		const seedService = app.get(SeedService);
		await seedService.seedAll();
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exit(1);
	} finally {
		await app.close();
	}
}

bootstrap().catch((error) => {
	console.error("Unexpected error during seeding:", error);
	process.exit(1);
});
