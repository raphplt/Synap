import {
	Injectable,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

export interface UserWithoutPassword {
	id: string;
	email: string;
	username: string;
	avatarUrl?: string | null;
	xp: number;
	streak: number;
	interests: string[];
	lastActivityAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginatedUserResult {
	items: UserWithoutPassword[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	private toUserWithoutPassword(user: User): UserWithoutPassword {
		const { passwordHash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}

	async findAllPaginated(
		page: number = 1,
		limit: number = 20,
		search?: string
	): Promise<PaginatedUserResult> {
		const safePage = Math.max(1, page);
		const safeLimit = Math.min(100, Math.max(1, limit));
		const skip = (safePage - 1) * safeLimit;

		const queryBuilder = this.userRepository.createQueryBuilder("user");

		if (search && search.trim()) {
			queryBuilder.where(
				"user.username ILIKE :search OR user.email ILIKE :search",
				{ search: `%${search.trim()}%` }
			);
		}

		queryBuilder.orderBy("user.createdAt", "DESC").skip(skip).take(safeLimit);

		const [users, total] = await queryBuilder.getManyAndCount();

		return {
			items: users.map((u) => this.toUserWithoutPassword(u)),
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		};
	}

	async findAll(): Promise<UserWithoutPassword[]> {
		const users = await this.userRepository.find({
			order: { createdAt: "DESC" },
		});
		return users.map((u) => this.toUserWithoutPassword(u));
	}

	async findById(id: string): Promise<User | null> {
		return await this.userRepository.findOne({ where: { id } });
	}

	async findByIdSafe(id: string): Promise<UserWithoutPassword | null> {
		const user = await this.findById(id);
		return user ? this.toUserWithoutPassword(user) : null;
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

	async update(
		id: string,
		data: Partial<{
			email: string;
			username: string;
			avatarUrl: string | null;
			xp: number;
			streak: number;
			interests: string[];
		}>
	): Promise<UserWithoutPassword> {
		const user = await this.findById(id);
		if (!user) {
			throw new NotFoundException("USER_NOT_FOUND");
		}

		// Check email uniqueness if changing
		if (data.email && data.email !== user.email) {
			const existing = await this.findByEmail(data.email);
			if (existing) {
				throw new ConflictException("EMAIL_ALREADY_EXISTS");
			}
		}

		// Check username uniqueness if changing
		if (data.username && data.username !== user.username) {
			const existing = await this.findByUsername(data.username);
			if (existing) {
				throw new ConflictException("USERNAME_ALREADY_EXISTS");
			}
		}

		Object.assign(user, data);
		const savedUser = await this.userRepository.save(user);
		return this.toUserWithoutPassword(savedUser);
	}

	async delete(id: string): Promise<void> {
		const user = await this.findById(id);
		if (!user) {
			throw new NotFoundException("USER_NOT_FOUND");
		}
		await this.userRepository.remove(user);
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

	async count(): Promise<number> {
		return await this.userRepository.count();
	}
}
