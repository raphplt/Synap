import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useRouter, Href } from "expo-router";
import {
	Text,
	View,
	TextInput,
	Pressable,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../src/stores/useAuthStore";
import { login as apiLogin } from "../src/lib/api";
import { SocialAuthButtons } from "../src/components/SocialAuthButtons";

export default function LoginScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const authLogin = useAuthStore((state) => state.login);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (isAuthenticated) {
			if (!user?.interests || user.interests.length === 0) {
				router.replace("/onboarding" as Href);
			} else {
				router.replace("/(tabs)" as Href);
			}
		}
	}, [isAuthenticated, router, user?.interests]);

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await apiLogin(email.trim().toLowerCase(), password);
			await authLogin(response);
			if (!response.user.interests || response.user.interests.length === 0) {
				router.replace("/onboarding" as Href);
			} else {
				router.replace("/(tabs)" as Href);
			}
		} catch (err) {
			setError(t("auth.invalidCredentials"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-synap-teal">
			<StatusBar style="light" />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1 justify-center px-8"
			>
				<View className="items-center mb-12">
					<Text className="text-4xl font-extrabold text-white mb-2 tracking-tight">SYNAP</Text>
					<Text className="text-text-secondary text-lg font-medium">{t("auth.login")}</Text>
				</View>

				<SocialAuthButtons mode="login" />

				<View className="gap-4">
					<View>
						<Text className="text-text-secondary text-sm mb-2">{t("auth.email")}</Text>
						<TextInput
							className="bg-synap-teal-medium border border-synap-teal-light rounded-xl px-4 py-3.5 text-white shadow-sm focus:border-synap-emerald transition-colors"
							placeholder="email@example.com"
							placeholderTextColor="#71717A"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							value={email}
							onChangeText={setEmail}
						/>
					</View>

					{/* Password */}
					<View>
						<Text className="text-text-secondary text-sm mb-2">{t("auth.password")}</Text>
						<TextInput
							className="bg-synap-teal-medium border border-synap-teal-light rounded-xl px-4 py-3.5 text-white shadow-sm focus:border-synap-emerald transition-colors"
							placeholder="••••••••"
							placeholderTextColor="#71717A"
							secureTextEntry
							value={password}
							onChangeText={setPassword}
						/>
					</View>

					{/* Error */}
					{error && <Text className="text-synap-pink text-center">{error}</Text>}

					{/* Submit */}
					<Pressable
						className={`bg-synap-pink py-4 rounded-xl shadow-lg border-b-4 border-synap-pink-dark mt-6 active:border-b-0 active:translate-y-1 transition-all active:bg-synap-pink-light ${
							isLoading || !email.trim() || !password.trim() ? "opacity-50" : ""
						}`}
						onPress={handleLogin}
						disabled={isLoading || !email.trim() || !password.trim()}
					>
						{isLoading ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text className="text-white text-lg font-bold text-center tracking-wide">
								{t("auth.login")}
							</Text>
						)}
					</Pressable>

					{/* Forgot password */}
					<Pressable className="py-2 active:opacity-70">
						<Text className="text-synap-ocean-light text-center text-sm font-medium">
							{t("auth.forgotPassword")}
						</Text>
					</Pressable>
				</View>

				{/* Sign up link */}
				<View className="flex-row justify-center mt-8">
					<Text className="text-text-secondary">{t("auth.noAccount")} </Text>
					<Pressable onPress={() => router.push("/signup" as Href)}>
						<Text className="text-synap-emerald font-semibold">{t("auth.signup")}</Text>
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}
