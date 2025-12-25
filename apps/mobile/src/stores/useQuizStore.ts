import { create } from "zustand";
import { CardBase } from "@synap/shared";

export type QuizState = "IDLE" | "INTRO" | "QUESTION" | "REVEAL" | "RESULT";

export interface QuizCard extends CardBase {
	userAnswer?: "FORGOT" | "RETAINED";
}

interface QuizStore {
	// State
	state: QuizState;
	cards: QuizCard[];
	currentIndex: number;
	score: number;
	xpEarned: number;

	// Actions
	startQuiz: (cards: CardBase[]) => void;
	nextCard: () => void;
	revealAnswer: () => void;
	answerCard: (answer: "FORGOT" | "RETAINED") => void;
	endQuiz: () => void;
	resetQuiz: () => void;

	// Getters
	getCurrentCard: () => QuizCard | null;
	getProgress: () => { current: number; total: number };
	isComplete: () => boolean;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
	// Initial state
	state: "IDLE",
	cards: [],
	currentIndex: 0,
	score: 0,
	xpEarned: 0,

	// Start a new quiz session
	startQuiz: (cards) => {
		// Shuffle cards and take first 10
		const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, 10);
		set({
			state: "INTRO",
			cards: shuffled.map((c) => ({ ...c, userAnswer: undefined })),
			currentIndex: 0,
			score: 0,
			xpEarned: 0,
		});
		// Auto-transition to first question after intro
		setTimeout(() => {
			set({ state: "QUESTION" });
		}, 2000);
	},

	// Move to next card or finish
	nextCard: () => {
		const { currentIndex, cards } = get();
		if (currentIndex < cards.length - 1) {
			set({
				currentIndex: currentIndex + 1,
				state: "QUESTION",
			});
		} else {
			set({ state: "RESULT" });
		}
	},

	// Show the answer
	revealAnswer: () => {
		set({ state: "REVEAL" });
	},

	// Record user's self-assessment
	answerCard: (answer) => {
		const { currentIndex, cards, score, xpEarned } = get();
		const updatedCards = [...cards];
		updatedCards[currentIndex] = { ...updatedCards[currentIndex], userAnswer: answer };

		const newScore = answer === "RETAINED" ? score + 1 : score;
		const xpGain = answer === "RETAINED" ? 25 : 5;

		set({
			cards: updatedCards,
			score: newScore,
			xpEarned: xpEarned + xpGain,
		});

		// Auto-advance to next card after short delay
		setTimeout(() => {
			get().nextCard();
		}, 500);
	},

	// End the quiz early
	endQuiz: () => {
		set({ state: "RESULT" });
	},

	// Reset everything
	resetQuiz: () => {
		set({
			state: "IDLE",
			cards: [],
			currentIndex: 0,
			score: 0,
			xpEarned: 0,
		});
	},

	// Get current card
	getCurrentCard: () => {
		const { cards, currentIndex } = get();
		return cards[currentIndex] ?? null;
	},

	// Get progress
	getProgress: () => {
		const { cards, currentIndex } = get();
		return { current: currentIndex + 1, total: cards.length };
	},

	// Check if quiz is complete
	isComplete: () => {
		return get().state === "RESULT";
	},
}));
