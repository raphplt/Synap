module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		project: "./tsconfig.json",
		tsconfigRootDir: __dirname,
	},
	env: {
		es2021: true,
		node: true,
	},
	plugins: ["@typescript-eslint", "react", "react-hooks"],
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	rules: {
		"react/react-in-jsx-scope": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
	},
	settings: {
		react: {
			version: "detect",
		},
	},
};
