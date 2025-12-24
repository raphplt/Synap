/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require("nativewind/preset")],
	content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// SYNAP Brand Colors (from charte.md)
				synap: {
					// Primary Palette
					pink: "#EF476F", // Bubblegum Pink - Primary action & energy
					"pink-light": "#FF6B8A", // Hover states
					"pink-dark": "#D63459", // Pressed states
					gold: "#FFD166", // Royal Gold - Success & achievement
					"gold-light": "#FFE499", // Backgrounds
					"gold-dark": "#E6B84D", // Text on dark
					emerald: "#06D6A0", // Growth & progress
					"emerald-light": "#39E5BA", // Success hints
					"emerald-dark": "#05B882", // Deep success
					ocean: "#118AB2", // Focus & exploration
					"ocean-light": "#3FA9C8", // Info backgrounds
					"ocean-dark": "#0D6B8A", // Deep focus
					teal: "#073B4C", // Dark Teal - Foundation & depth
					"teal-medium": "#0A5266", // Elevated surfaces
					"teal-light": "#0E6A80", // Borders & dividers
				},
				// Text colors
				text: {
					primary: "#FFFFFF",
					secondary: "#D4D4D8",
					tertiary: "#71717A",
					disabled: "#52525B",
				},
				// Neutral Palette
				neutral: {
					white: "#FFFFFF",
					"off-white": "#F8F9FA",
					"light-gray": "#D1D5DB",
					"medium-gray": "#9CA3AF",
					"dark-gray": "#4B5563",
					"near-black": "#1F2937",
				},
				// Legacy colors (for backward compatibility)
				ink: "#073B4C", // Maps to synap-teal
				dusk: "#0A5266", // Maps to synap-teal-medium
				neon: "#06D6A0", // Maps to synap-emerald
				amber: "#FFD166", // Maps to synap-gold
				sand: "#D4D4D8", // Maps to text-secondary
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				display: ["Geist", "Inter", "system-ui", "sans-serif"],
			},
			fontSize: {
				display: ["3.5rem", { lineHeight: "1.1", fontWeight: "600" }],
				h1: ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],
				h2: ["2rem", { lineHeight: "1.25", fontWeight: "600" }],
				h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
				"body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
				body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
				"body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
				caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
			},
			spacing: {
				xxs: "4px",
				xs: "8px",
				sm: "12px",
				md: "16px",
				lg: "24px",
				xl: "32px",
				"2xl": "48px",
				"3xl": "64px",
			},
			borderRadius: {
				DEFAULT: "8px",
				sm: "4px",
				lg: "12px",
				xl: "16px",
			},
			animation: {
				"fade-in": "fadeIn 200ms ease-out",
				"slide-up": "slideUp 300ms ease-out",
				"scale-in": "scaleIn 150ms ease-out",
				pulse: "pulse 1000ms ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(16px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				scaleIn: {
					"0%": { opacity: "0", transform: "scale(0.95)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
			},
		},
	},
	plugins: [],
};
