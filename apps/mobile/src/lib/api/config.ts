/**
 * API Configuration - Base URL and common utilities
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeBaseUrl(raw: string): string {
	const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
	return trimmed.replace(/\/+$/, "");
}

function guessLanHost(): string | null {
	const hostUri =
		(Constants.expoConfig as { hostUri?: string })?.hostUri ??
		(Constants as unknown as { expoGoConfig?: { debuggerHost?: string } })?.expoGoConfig?.debuggerHost ??
		null;

	if (typeof hostUri !== "string" || hostUri.length === 0) return null;

	const host = hostUri.split(":")[0];
	return host.length > 0 ? host : null;
}

export function getApiBaseUrl(): string {
	if (
		process.env.EXPO_PUBLIC_API_URL != null &&
		process.env.EXPO_PUBLIC_API_URL.length > 0
	) {
		return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
	}

	const host = guessLanHost();
	if (host != null) {
		return `http://${host}:3000`;
	}

	return normalizeBaseUrl(
		Platform.select({
			ios: "http://localhost:3000",
			android: "http://10.0.2.2:3000",
			default: "http://localhost:3000",
		}) as string
	);
}

/**
 * Common HTTP error handler
 */
export async function handleApiError(response: Response): Promise<never> {
	try {
		const error = await response.json();
		throw new Error(error.message ?? `HTTP ${response.status}`);
	} catch {
		throw new Error(`HTTP ${response.status}`);
	}
}
