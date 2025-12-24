const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

interface ApiOptions extends RequestInit {
	token?: string
}

async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
	const { token, ...fetchOptions } = options

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...options.headers,
	}

	if (token) {
		(headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...fetchOptions,
		headers,
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: response.statusText }))
		throw new Error(error.message ?? "API Error")
	}

	return response.json()
}

// Auth
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; user: User }
export interface SignupRequest { email: string; username: string; password: string }

export const authApi = {
	login: (data: LoginRequest) => fetchApi<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
	signup: (data: SignupRequest) => fetchApi<LoginResponse>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
	getMe: (token: string) => fetchApi<User>("/auth/me", { token }),
}

// Users
export interface User {
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

export const usersApi = {
	getAll: (token: string) => fetchApi<User[]>("/users", { token }),
	getById: (id: string, token: string) => fetchApi<User>(`/users/${id}`, { token }),
	delete: (id: string, token: string) => fetchApi<void>(`/users/${id}`, { method: "DELETE", token }),
}

// Cards
export interface Card {
	id: string
	title: string
	summary: string
	content: string
	mediaUrl: string
	sourceLink: string
	sourceAttribution?: string | null
	sourceType?: string | null
	sourceId?: string | null
	origin: string
	externalId?: string | null
	qualityScore: number
	deckId?: string | null
	createdAt: string
	updatedAt: string
}

export interface CreateCardRequest {
	title: string
	summary: string
	content: string
	mediaUrl?: string
	sourceLink?: string
	origin?: string
	qualityScore?: number
	deckId?: string
}

export const cardsApi = {
	getAll: (token: string) => fetchApi<Card[]>("/cards", { token }),
	getById: (id: string, token: string) => fetchApi<Card>(`/cards/${id}`, { token }),
	create: (data: CreateCardRequest, token: string) => fetchApi<Card>("/cards", { method: "POST", body: JSON.stringify(data), token }),
	update: (id: string, data: Partial<CreateCardRequest>, token: string) => fetchApi<Card>(`/cards/${id}`, { method: "PATCH", body: JSON.stringify(data), token }),
	delete: (id: string, token: string) => fetchApi<void>(`/cards/${id}`, { method: "DELETE", token }),
}

// Categories
export interface Category {
	id: string
	name: string
	slug: string
	description?: string | null
	imageUrl?: string | null
	sortOrder: number
	createdAt: string
	updatedAt: string
}

export interface CreateCategoryRequest {
	name: string
	slug: string
	description?: string
	imageUrl?: string
}

export const categoriesApi = {
	getAll: () => fetchApi<Category[]>("/decks/categories"),
	create: (data: CreateCategoryRequest, token: string) => fetchApi<Category>("/categories", { method: "POST", body: JSON.stringify(data), token }),
	update: (id: string, data: Partial<CreateCategoryRequest>, token: string) => fetchApi<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data), token }),
	delete: (id: string, token: string) => fetchApi<void>(`/categories/${id}`, { method: "DELETE", token }),
}

// Decks
export interface Deck {
	id: string
	name: string
	slug: string
	description: string
	imageUrl: string
	categoryId?: string | null
	cardCount: number
	sortOrder: number
	isActive: boolean
	createdAt: string
	updatedAt: string
	category?: Category | null
	cards?: Card[]
}

export interface CreateDeckRequest {
	name: string
	slug: string
	description: string
	imageUrl?: string
	categoryId?: string
	isActive?: boolean
}

export const decksApi = {
	getAll: () => fetchApi<Deck[]>("/decks"),
	getBySlug: (slug: string) => fetchApi<Deck>(`/decks/${slug}`),
	create: (data: CreateDeckRequest, token: string) => fetchApi<Deck>("/decks", { method: "POST", body: JSON.stringify(data), token }),
	update: (id: string, data: Partial<CreateDeckRequest>, token: string) => fetchApi<Deck>(`/decks/${id}`, { method: "PATCH", body: JSON.stringify(data), token }),
	delete: (id: string, token: string) => fetchApi<void>(`/decks/${id}`, { method: "DELETE", token }),
}

// Seed
export const seedApi = {
	seedGold: () => fetchApi<{ categories: number; decks: number; cards: number }>("/seed/gold", { method: "POST" }),
}

// Stats  
export interface DashboardStats {
	totalUsers: number
	totalCards: number
	totalDecks: number
	totalCategories: number
}

export const statsApi = {
	getDashboard: (token: string) => fetchApi<DashboardStats>("/admin/stats", { token }).catch(() => ({
		totalUsers: 0,
		totalCards: 0,
		totalDecks: 0,
		totalCategories: 0,
	})),
}
