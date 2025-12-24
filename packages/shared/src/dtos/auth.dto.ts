// Auth DTOs
export interface CreateUserDto {
	email: string
	username: string
	password: string
	interests?: string[]
}

export interface LoginDto {
	email: string
	password: string
}

export interface UserResponseDto {
	id: string
	email: string
	username: string
	avatarUrl?: string | null
	xp: number
	streak: number
	interests: string[]
	createdAt: string
	updatedAt: string
}

export interface LoginResponseDto {
	accessToken: string
	user: UserResponseDto
}
