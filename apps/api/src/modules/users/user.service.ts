import {
	Injectable,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	async findById(id: string): Promise<User | null> {
		return await this.userRepository.findOne({ where: { id } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.userRepository.findOne({ where: { email } });
	}

	async findByUsername(username: string): Promise<User | null> {
		return await this.userRepository.findOne({ where: { username } });
	}

	async create(data: {
		email: string;
		username: string;
		passwordHash: string;
		interests?: string[];
	}): Promise<User> {
		// Check for existing email
		const existingEmail = await this.findByEmail(data.email);
		if (existingEmail) {
			throw new ConflictException("EMAIL_ALREADY_EXISTS");
		}

		// Check for existing username
		const existingUsername = await this.findByUsername(data.username);
		if (existingUsername) {
			throw new ConflictException("USERNAME_ALREADY_EXISTS");
		}

		const user = this.userRepository.create({
			email: data.email,
			username: data.username,
			passwordHash: data.passwordHash,
			interests: data.interests ?? [],
		});

		return await this.userRepository.save(user);
	}

	async updateLastActivity(userId: string): Promise<void> {
		await this.userRepository.update(userId, {
			lastActivityAt: new Date(),
		});
	}

	async updateStreak(userId: string, streak: number): Promise<void> {
		await this.userRepository.update(userId, { streak });
	}

	async addXp(userId: string, xpToAdd: number): Promise<User> {
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("USER_NOT_FOUND");
		}

		user.xp += xpToAdd;
		return await this.userRepository.save(user);
	}

	async updateInterests(userId: string, interests: string[]): Promise<User> {
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("USER_NOT_FOUND");
		}

		user.interests = interests;
		return await this.userRepository.save(user);
	}
}
