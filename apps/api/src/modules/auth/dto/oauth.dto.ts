import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class OAuthLoginDto {
	@IsNotEmpty()
	@IsIn(["google", "apple"])
		provider!: "google" | "apple";

	@IsNotEmpty()
	@IsString()
		idToken!: string;

	@IsOptional()
	@IsString()
		username?: string;
}
