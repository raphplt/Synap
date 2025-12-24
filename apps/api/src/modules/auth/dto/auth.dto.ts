import {
	IsEmail,
	IsString,
	MinLength,
	MaxLength,
	IsArray,
	IsOptional,
} from "class-validator";

export class CreateUserDto {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(3)
	@MaxLength(50)
	username!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(100)
	password!: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	interests?: string[];
}

export class LoginDto {
	@IsEmail()
	email!: string;

	@IsString()
	password!: string;
}
