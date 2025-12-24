import { useState } from "react";
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

export default function LoginScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const authLogin = useAuthStore((state) => state.login);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await apiLogin(email.trim().toLowerCase(), password);
			await authLogin(response);
			router.replace("/(tabs)" as Href);
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
				{/* Header */}
				<View className="items-center mb-12">
					<Text className="text-3xl font-bold text-white mb-2">SYNAP</Text>
					<Text className="text-text-secondary">{t("auth.login")}</Text>
				</View>

				{/* Form */}
				<View className="gap-4">
					{/* Email */}
					<View>
						<Text className="text-text-secondary text-sm mb-2">
							{t("auth.email")}
						</Text>
						<TextInput
							className="bg-synap-teal-medium border border-synap-teal-light rounded-lg px-4 py-3 text-white"
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
						<Text className="text-text-secondary text-sm mb-2">
							{t("auth.password")}
						</Text>
						<TextInput
							className="bg-synap-teal-medium border border-synap-teal-light rounded-lg px-4 py-3 text-white"
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
						className="bg-synap-pink py-4 rounded-lg mt-4 active:bg-synap-pink-dark disabled:opacity-50"
						onPress={handleLogin}
						disabled={isLoading || !email.trim() || !password.trim()}
					>
						{isLoading ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text className="text-white text-lg font-semibold text-center">
								{t("auth.login")}
							</Text>
						)}
					</Pressable>

					{/* Forgot password */}
					<Pressable className="py-2">
						<Text className="text-synap-ocean text-center text-sm">
							{t("auth.forgotPassword")}
						</Text>
					</Pressable>
				</View>

				{/* Sign up link */}
				<View className="flex-row justify-center mt-8">
					<Text className="text-text-secondary">{t("auth.noAccount")} </Text>
					<Pressable onPress={() => router.push("/signup" as Href)}>
						<Text className="text-synap-emerald font-semibold">
							{t("auth.signup")}
						</Text>
					</Pressable>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}
