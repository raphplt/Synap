import { create } from "zustand"
import * as SecureStore from "expo-secure-store"
import type { UserResponseDto, LoginResponseDto } from "@memex/shared"

const TOKEN_KEY = "synap_auth_token"
const USER_KEY = "synap_user"

interface AuthState {
	token: string | null
	user: UserResponseDto | null
	isAuthenticated: boolean
	isLoading: boolean
	isInitialized: boolean

	// Actions
	initialize: () => Promise<void>
	login: (response: LoginResponseDto) => Promise<void>
	logout: () => Promise<void>
	setUser: (user: UserResponseDto) => void
}

export const useAuthStore = create<AuthState>((set) => ({
	token: null,
	user: null,
	isAuthenticated: false,
	isLoading: false,
	isInitialized: false,

	initialize: async () => {
		console.log("[Auth] Initializing...");
		set({ isLoading: true });

		try {
			const token = await SecureStore.getItemAsync(TOKEN_KEY);
			const userJson = await SecureStore.getItemAsync(USER_KEY);

			console.log("[Auth] Token found:", !!token);
			console.log("[Auth] User found:", !!userJson);

			if (token && userJson) {
				const user = JSON.parse(userJson) as UserResponseDto;
				console.log("[Auth] Restoring session for:", user.username);
				set({
					token,
					user,
					isAuthenticated: true,
					isLoading: false,
					isInitialized: true,
				});
			} else {
				console.log("[Auth] No session found");
				set({
					token: null,
					user: null,
					isAuthenticated: false,
					isLoading: false,
					isInitialized: true,
				});
			}
		} catch (error) {
			console.error("[Auth] Failed to initialize:", error);
			set({
				token: null,
				user: null,
				isAuthenticated: false,
				isLoading: false,
				isInitialized: true,
			});
		}
	},

	login: async (response: LoginResponseDto) => {
		console.log("[Auth] Logging in user:", response.user.username);
		set({ isLoading: true });

		try {
			await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
			await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));

			console.log("[Auth] Session saved successfully");

			set({
				token: response.accessToken,
				user: response.user,
				isAuthenticated: true,
				isLoading: false,
			});
		} catch (error) {
			console.error("[Auth] Failed to save session:", error);
			set({ isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		console.log("[Auth] Logging out...");
		set({ isLoading: true });

		try {
			await SecureStore.deleteItemAsync(TOKEN_KEY);
			await SecureStore.deleteItemAsync(USER_KEY);

			console.log("[Auth] Session cleared");

			set({
				token: null,
				user: null,
				isAuthenticated: false,
				isLoading: false,
			});
		} catch (error) {
			console.error("[Auth] Failed to clear session:", error);
			set({ isLoading: false });
		}
	},

	setUser: (user: UserResponseDto) => {
		set({ user });
		SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)).catch((error) => {
			console.error("[Auth] Failed to update user:", error);
		});
	},
}));
