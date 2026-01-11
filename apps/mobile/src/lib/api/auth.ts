/**
 * Authentication API
 */
import { LoginResponseDto, UserResponseDto } from "@synap/shared";
import { getApiBaseUrl, handleApiError } from "./config";

export async function signup(
	data: {
		email: string;
		username: string;
		password: string;
		interests?: string[];
	},
	baseUrl = getApiBaseUrl()
): Promise<LoginResponseDto> {
	const response = await fetch(`${baseUrl}/auth/signup`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		await handleApiError(response);
	}

	return response.json();
}

export async function login(
	email: string,
	password: string,
	baseUrl = getApiBaseUrl()
): Promise<LoginResponseDto> {
	const response = await fetch(`${baseUrl}/auth/login`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		await handleApiError(response);
	}

	return response.json();
}

export async function getMe(
	token: string,
	baseUrl = getApiBaseUrl()
): Promise<UserResponseDto> {
	const response = await fetch(`${baseUrl}/auth/me`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	return response.json();
}

export async function oauthLogin(
	data: {
		provider: "google" | "apple";
		idToken: string;
		username?: string;
	},
	baseUrl = getApiBaseUrl()
): Promise<LoginResponseDto> {
	const response = await fetch(`${baseUrl}/auth/oauth`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		await handleApiError(response);
	}

	return response.json();
}
