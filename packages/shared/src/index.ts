import {
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	Max,
	IsUrl,
	IsArray,
} from "class-validator";

// --- Domain Interfaces ---

export interface ICard {
	id: string; // UUID
	title: string;
	summary: string;
	content: string; // markdown
	type: "LEARN" | "QUIZ";
	category: string;
	difficultyLevel: number; // 1-5
	mediaUrl: string; // image
	sourceLink?: string; // Wikipedia URL
	tags: string[];
}

export interface IFeedResponse {
	data: ICard[];
	take: number;
	skip: number;
	total?: number;
}

// --- DTOs ---

export class CreateCardDto {
	@IsString()
	@IsNotEmpty()
	title!: string;

	@IsString()
	@IsNotEmpty()
	summary!: string;

	@IsString()
	@IsNotEmpty()
	content!: string;

	@IsEnum(["LEARN", "QUIZ"])
	type!: "LEARN" | "QUIZ";

	@IsString()
	@IsNotEmpty()
	category!: string;

	@IsInt()
	@Min(1)
	@Max(5)
	difficultyLevel!: number;

	@IsUrl()
	mediaUrl!: string;

	@IsOptional()
	@IsUrl()
	sourceLink?: string;

	@IsArray()
	@IsString({ each: true })
	tags!: string[];
}

export class LoginDto {
	@IsString()
	@IsNotEmpty()
	username!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	username!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;
}
