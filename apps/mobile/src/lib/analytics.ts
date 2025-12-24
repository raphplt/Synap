import PostHog from "posthog-react-native";

// Initialize PostHog - replace with your actual API key
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const POSTHOG_HOST = "https://app.posthog.com";

let posthogClient: PostHog | null = null;

type JsonType =
	| string
	| number
	| boolean
	| null
	| JsonType[]
	| { [key: string]: JsonType };
type EventProperties = Record<string, JsonType>;

export const initAnalytics = async () => {
	if (!POSTHOG_API_KEY) {
		console.log("PostHog API key not configured, analytics disabled");
		return;
	}

	posthogClient = new PostHog(POSTHOG_API_KEY, {
		host: POSTHOG_HOST,
	});
};

export const identifyUser = (userId: string, properties?: EventProperties) => {
	if (!posthogClient) return;
	posthogClient.identify(userId, properties);
};

export const resetUser = () => {
	if (!posthogClient) return;
	posthogClient.reset();
};

// Event tracking functions
export const trackEvent = (event: string, properties?: EventProperties) => {
	if (!posthogClient) return;
	posthogClient.capture(event, properties);
};

// Specific event trackers
export const trackSignup = (userId: string, method: "email" = "email") => {
	trackEvent("SIGNUP", { userId, method });
};

export const trackLogin = (userId: string) => {
	trackEvent("LOGIN", { userId });
};

export const trackCardView = (cardId: string, deckId?: string) => {
	trackEvent("CARD_VIEW", deckId ? { cardId, deckId } : { cardId });
};

export const trackCardFlip = (cardId: string, deckId?: string) => {
	trackEvent("CARD_FLIP", deckId ? { cardId, deckId } : { cardId });
};

export const trackSrsReview = (
	cardId: string,
	rating: "AGAIN" | "HARD" | "GOOD" | "EASY",
	deckId?: string
) => {
	trackEvent(
		"SRS_REVIEW",
		deckId ? { cardId, rating, deckId } : { cardId, rating }
	);
};

export const trackQuizComplete = (
	deckId: string,
	score: number,
	totalCards: number
) => {
	trackEvent("QUIZ_COMPLETE", { deckId, score, totalCards });
};

export const trackDeckView = (deckId: string, deckName: string) => {
	trackEvent("DECK_VIEW", { deckId, deckName });
};

export const trackOnboardingComplete = (interests: string[]) => {
	trackEvent("ONBOARDING_COMPLETE", {
		interests,
		interestCount: interests.length,
	});
};

export const trackScreenView = (screenName: string) => {
	trackEvent("SCREEN_VIEW", { screenName });
};

export default {
	init: initAnalytics,
	identify: identifyUser,
	reset: resetUser,
	track: trackEvent,
	trackSignup,
	trackLogin,
	trackCardView,
	trackCardFlip,
	trackSrsReview,
	trackQuizComplete,
	trackDeckView,
	trackOnboardingComplete,
	trackScreenView,
};
