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
	ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../src/stores/useAuthStore";
import { signup as apiSignup } from "../src/lib/api";

export default function SignupScreen() {
	const { t } = useTranslation();
	const router = useRouter();
	const authLogin = useAuthStore((state) => state.login);

	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSignup = async () => {
		if (!email.trim() || !username.trim() || !password.trim()) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await apiSignup({
				email: email.trim().toLowerCase(),
				username: username.trim(),
				password,
			});
			await authLogin(response);
			router.replace("/onboarding" as Href);
		} catch (err) {
			const errorMessage = (err as Error).message;
			if (errorMessage.includes("EMAIL")) {
				setError(t("auth.emailExists"));
			} else if (errorMessage.includes("USERNAME")) {
				setError(t("auth.usernameExists"));
			} else {
				setError(t("common.error"));
			}
		} finally {
			setIsLoading(false);
		}
	};

	const isValid =
		email.trim().length > 0 &&
		username.trim().length >= 3 &&
		password.length >= 8;

	return (
		<View className="flex-1 bg-synap-teal">
			<StatusBar style="light" />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<ScrollView
					contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
					className="px-8"
					keyboardShouldPersistTaps="handled"
				>
					{/* Header */}
					<View className="items-center mb-12">
						<Text className="text-3xl font-bold text-white mb-2">SYNAP</Text>
						<Text className="text-text-secondary">{t("auth.signup")}</Text>
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

						{/* Username */}
						<View>
							<Text className="text-text-secondary text-sm mb-2">
								{t("auth.username")}
							</Text>
							<TextInput
								className="bg-synap-teal-medium border border-synap-teal-light rounded-lg px-4 py-3 text-white"
								placeholder="synaper42"
								placeholderTextColor="#71717A"
								autoCapitalize="none"
								autoCorrect={false}
								value={username}
								onChangeText={setUsername}
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
							<Text className="text-text-tertiary text-xs mt-1">
								Minimum 8 caractères
							</Text>
						</View>

						{/* Error */}
						{error && <Text className="text-synap-pink text-center">{error}</Text>}

						{/* Submit */}
						<Pressable
							className="bg-synap-pink py-4 rounded-lg mt-4 active:bg-synap-pink-dark disabled:opacity-50"
							onPress={handleSignup}
							disabled={isLoading || !isValid}
						>
							{isLoading ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<Text className="text-white text-lg font-semibold text-center">
									{t("auth.signup")}
								</Text>
							)}
						</Pressable>
					</View>

					{/* Login link */}
					<View className="flex-row justify-center mt-8 pb-8">
						<Text className="text-text-secondary">{t("auth.hasAccount")} </Text>
						<Pressable onPress={() => router.push("/login" as Href)}>
							<Text className="text-synap-emerald font-semibold">
								{t("auth.login")}
							</Text>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
