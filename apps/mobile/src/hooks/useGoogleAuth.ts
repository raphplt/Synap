import { useState, useCallback } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { oauthLogin } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";
import { useRouter, Href } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

// Google OAuth discovery document
const discovery = {
	authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenEndpoint: "https://oauth2.googleapis.com/token",
};

export function useGoogleAuth() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const authLogin = useAuthStore((state) => state.login);
	const router = useRouter();

	// Generate redirect URI
	const redirectUri = AuthSession.makeRedirectUri({
		scheme: "synap",
	});

	// Create auth request
	const [request, response, promptAsync] = AuthSession.useAuthRequest(
		{
			clientId: GOOGLE_CLIENT_ID ?? "",
			scopes: ["openid", "profile", "email"],
			redirectUri,
			responseType: AuthSession.ResponseType.IdToken,
			usePKCE: true,
			extraParams: {
				nonce: Crypto.randomUUID(),
			},
		},
		discovery,
	);

	const signIn = useCallback(async () => {
		if (!GOOGLE_CLIENT_ID) {
			setError("Google Client ID not configured");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const result = await promptAsync();

			if (result.type === "success" && result.params.id_token) {
				const response = await oauthLogin({
					provider: "google",
					idToken: result.params.id_token,
				});

				await authLogin(response);
				router.replace("/(tabs)" as Href);
			} else if (result.type === "cancel") {
				// User cancelled - not an error
			} else if (result.type === "error") {
				setError(result.error?.message ?? "Google sign-in failed");
			}
		} catch (err) {
			const message = (err as Error).message;
			if (message.includes("EMAIL_ALREADY_REGISTERED")) {
				setError("Cet email est déjà utilisé avec un mot de passe");
			} else {
				setError("Une erreur est survenue");
			}
		} finally {
			setIsLoading(false);
		}
	}, [promptAsync, authLogin, router]);

	return {
		signIn,
		isLoading,
		error,
		isAvailable: !!GOOGLE_CLIENT_ID && !!request,
	};
}
