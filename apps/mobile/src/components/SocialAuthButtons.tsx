import { View, Text, Pressable, ActivityIndicator, Platform, Image } from "react-native";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAppleAuth } from "../hooks/useAppleAuth";

interface SocialAuthButtonsProps {
	mode?: "login" | "signup";
}

export function SocialAuthButtons({ mode = "login" }: SocialAuthButtonsProps) {
	const google = useGoogleAuth();
	const apple = useAppleAuth();

	const combinedError = google.error ?? apple.error;

	return (
		<View className="gap-3">
			{combinedError && (
				<Text className="text-synap-pink text-center text-sm">{combinedError}</Text>
			)}

			{google.isAvailable && (
				<Pressable
					className={`bg-white py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-sm ${
						google.isLoading ? "opacity-50" : ""
					}`}
					onPress={google.signIn}
					disabled={google.isLoading}
				>
					{google.isLoading ? (
						<ActivityIndicator size="small" color="#1f2937" />
					) : (
						<>
							<Image
								source={require("../../assets/icons/icon-google.png")}
								alt="Google"
								className="w-6 h-6"
							/>
							<Text className="text-gray-800 font-semibold text-base">
								{mode === "login" ? "Continuer avec Google" : "S'inscrire avec Google"}
							</Text>
						</>
					)}
				</Pressable>
			)}

			{/* Apple Button (iOS only) */}
			{Platform.OS === "ios" && apple.isAvailable && (
				<Pressable
					className={`bg-black py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-sm ${
						apple.isLoading ? "opacity-50" : ""
					}`}
					onPress={apple.signIn}
					disabled={apple.isLoading}
				>
					{apple.isLoading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<>
							<AppleIcon />
							<Text className="text-white font-semibold text-base">
								{mode === "login" ? "Continuer avec Apple" : "S'inscrire avec Apple"}
							</Text>
						</>
					)}
				</Pressable>
			)}

			{/* Divider */}
			{(google.isAvailable || (Platform.OS === "ios" && apple.isAvailable)) && (
				<View className="flex-row items-center my-2">
					<View className="flex-1 h-px bg-synap-teal-light" />
					<Text className="text-text-tertiary mx-4 text-sm">ou</Text>
					<View className="flex-1 h-px bg-synap-teal-light" />
				</View>
			)}
		</View>
	);
}

function AppleIcon() {
	return (
		<View className="w-5 h-5 items-center justify-center">
			<Text className="text-lg font-bold text-white"></Text>
		</View>
	);
}
