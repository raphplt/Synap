import { create } from "zustand";

export interface SessionStats {
	cardsViewed: number;
	cardsRetained: number;
	cardsForgot: number;
	xpEarned: number;
}

interface SessionState {
	stats: SessionStats;
	showRecap: boolean;
	sessionActive: boolean;
	// Actions
	startSession: () => void;
	endSession: () => void;
	recordCardView: () => void;
	recordRetained: (xp: number) => void;
	recordForgot: (xp: number) => void;
	addXp: (amount: number) => void;
	showRecapModal: () => void;
	hideRecapModal: () => void;
	continueSession: () => void;
	resetSession: () => void;
}

const CARDS_BEFORE_RECAP = 10;

export const useSessionStore = create<SessionState>((set, get) => ({
	stats: {
		cardsViewed: 0,
		cardsRetained: 0,
		cardsForgot: 0,
		xpEarned: 0,
	},
	showRecap: false,
	sessionActive: false,

	startSession: () =>
		set({
			sessionActive: true,
			stats: { cardsViewed: 0, cardsRetained: 0, cardsForgot: 0, xpEarned: 0 },
			showRecap: false,
		}),

	endSession: () =>
		set({
			sessionActive: false,
			showRecap: false,
		}),

	recordCardView: () => {
		const { stats, sessionActive } = get();
		if (!sessionActive) return;

		const newViewed = stats.cardsViewed + 1;
		set({
			stats: { ...stats, cardsViewed: newViewed },
		});

		// Trigger recap every CARDS_BEFORE_RECAP cards
		if (newViewed > 0 && newViewed % CARDS_BEFORE_RECAP === 0) {
			set({ showRecap: true });
		}
	},

	recordRetained: (xp: number) => {
		const { stats } = get();
		set({
			stats: {
				...stats,
				cardsRetained: stats.cardsRetained + 1,
				xpEarned: stats.xpEarned + xp,
			},
		});
	},

	recordForgot: (xp: number) => {
		const { stats } = get();
		set({
			stats: {
				...stats,
				cardsForgot: stats.cardsForgot + 1,
				xpEarned: stats.xpEarned + xp,
			},
		});
	},

	addXp: (amount: number) => {
		const { stats } = get();
		set({
			stats: { ...stats, xpEarned: stats.xpEarned + amount },
		});
	},

	showRecapModal: () => set({ showRecap: true }),

	hideRecapModal: () => set({ showRecap: false }),

	continueSession: () => set({ showRecap: false }),

	resetSession: () =>
		set({
			stats: { cardsViewed: 0, cardsRetained: 0, cardsForgot: 0, xpEarned: 0 },
			showRecap: false,
			sessionActive: true,
		}),
}));
