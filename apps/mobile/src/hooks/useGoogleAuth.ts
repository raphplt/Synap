import { useState, useEffect } from "react";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { oauthLogin } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";
import { useRouter, Href } from "expo-router";

export function useGoogleAuth() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const authLogin = useAuthStore((state) => state.login);
	const router = useRouter();

	useEffect(() => {
		GoogleSignin.configure({
			webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
			offlineAccess: true,
			forceCodeForRefreshToken: true,
			scopes: ["profile", "email"],
		});
	}, []);

	const signIn = async () => {
		setIsLoading(true);
		setError(null);

		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();

			if (userInfo.data?.idToken) {
				const response = await oauthLogin({
					provider: "google",
					idToken: userInfo.data.idToken,
				});

				await authLogin(response);
				router.replace("/(tabs)" as Href);
			} else {
				throw new Error("No ID token returned");
			}
		} catch (err) {
			const error = err as { code?: string; message?: string };
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				// User cancelled
			} else if (error.code === statusCodes.IN_PROGRESS) {
				// Operation in progress
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				setError("Google Play Services non disponible");
			} else {
				const message = error.message || "Erreur inconnue";
				if (message.includes("EMAIL_ALREADY_REGISTERED")) {
					setError("Cet email est déjà utilisé avec un mot de passe");
				} else {
					setError("Erreur de connexion Google");
				}
				console.error("Google Sign-In Error:", error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		signIn,
		isLoading,
		error,
		isAvailable: true,
	};
}
