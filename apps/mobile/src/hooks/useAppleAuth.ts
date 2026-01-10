import { useState, useCallback, useEffect } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { oauthLogin } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";
import { useRouter, Href } from "expo-router";

export function useAppleAuth() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isAvailable, setIsAvailable] = useState(false);
	const authLogin = useAuthStore((state) => state.login);
	const router = useRouter();

	// Check if Apple Sign In is available (iOS 13+)
	useEffect(() => {
		if (Platform.OS === "ios") {
			AppleAuthentication.isAvailableAsync().then(setIsAvailable);
		}
	}, []);

	const signIn = useCallback(async () => {
		if (!isAvailable) {
			setError("Apple Sign In not available");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
			});

			if (credential.identityToken) {
				// Build username from Apple-provided full name if available
				let username: string | undefined;
				if (credential.fullName?.givenName) {
					username = credential.fullName.givenName.toLowerCase();
					if (credential.fullName?.familyName) {
						username += credential.fullName.familyName.charAt(0).toLowerCase();
					}
				}

				const response = await oauthLogin({
					provider: "apple",
					idToken: credential.identityToken,
					username,
				});

				await authLogin(response);
				router.replace("/(tabs)" as Href);
			}
		} catch (err: unknown) {
			const error = err as { code?: string; message?: string };
			if (error.code === "ERR_REQUEST_CANCELED") {
				// User cancelled - not an error
			} else {
				const message = error.message ?? "";
				if (message.includes("EMAIL_ALREADY_REGISTERED")) {
					setError("Cet email est déjà utilisé avec un mot de passe");
				} else {
					setError("Une erreur est survenue");
				}
			}
		} finally {
			setIsLoading(false);
		}
	}, [isAvailable, authLogin, router]);

	return {
		signIn,
		isLoading,
		error,
		isAvailable,
	};
}
