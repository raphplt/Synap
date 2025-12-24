import {
	View,
	Text,
	Pressable,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getApiBaseUrl } from "../../src/lib/api";

interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	imageUrl?: string | null;
	sortOrder: number;
}

async function fetchCategories(): Promise<Category[]> {
	const response = await fetch(`${getApiBaseUrl()}/decks/categories`);
	if (!response.ok) throw new Error("Failed to fetch categories");
	return response.json();
}

function CategoryCard({
	category,
	onPress,
}: {
	category: Category;
	onPress: () => void;
}) {
	// Use emoji if imageUrl is an emoji, otherwise default icon
	const icon =
		category.imageUrl && !category.imageUrl.startsWith("http")
			? category.imageUrl
			: "📚";

	return (
		<Pressable
			className="bg-synap-teal-medium rounded-xl p-4 border border-synap-teal-light active:bg-synap-teal-light"
			onPress={onPress}
		>
			<View className="flex-row items-center">
				<View className="w-12 h-12 rounded-xl bg-synap-teal-dark items-center justify-center mr-4">
					<Text className="text-2xl">{icon}</Text>
				</View>
				<View className="flex-1">
					<Text className="text-white font-semibold text-lg" numberOfLines={1}>
						{category.name}
					</Text>
					{category.description && (
						<Text className="text-text-secondary text-sm" numberOfLines={2}>
							{category.description}
						</Text>
					)}
				</View>
				<Text className="text-text-tertiary text-xl">›</Text>
			</View>
		</Pressable>
	);
}

export default function AtlasScreen() {
	const { t } = useTranslation();
	const router = useRouter();

	const {
		data: categories,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["categories"],
		queryFn: fetchCategories,
	});

	const handleCategoryPress = (category: Category) => {
		router.push(`/atlas/${category.slug}`);
	};

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: "#073B4C" }}
			className="pb-20"
		>
			<View className="flex-1 p-4">
				<View className="mb-6">
					<Text className="text-white text-2xl font-bold">{t("atlas.title")}</Text>
					<Text className="text-text-secondary">
						{t("atlas.subtitle", "Explore les thèmes de connaissance")}
					</Text>
				</View>

				{/* Content */}
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator color="#06D6A0" size="large" />
					</View>
				) : error ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-synap-pink mb-4">{t("common.error")}</Text>
						<Text className="text-text-secondary text-center">
							Impossible de charger les catégories.
						</Text>
					</View>
				) : categories && categories.length > 0 ? (
					<ScrollView showsVerticalScrollIndicator={false}>
						<View className="gap-3">
							{categories.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									onPress={() => handleCategoryPress(category)}
								/>
							))}
						</View>
					</ScrollView>
				) : (
					<View className="flex-1 items-center justify-center">
						<Text className="text-4xl mb-4">�️</Text>
						<Text className="text-white text-lg font-semibold mb-2">
							Aucune catégorie
						</Text>
						<Text className="text-text-secondary text-center">
							Les catégories apparaîtront ici une fois les données importées.
						</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	);
}
