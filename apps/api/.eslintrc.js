module.exports = {
	parserOptions: {
		project: "./tsconfig.json",
		tsconfigRootDir: __dirname,
	},
	ignorePatterns: [".eslintrc.js"],
	env: {
		node: true,
		es2021: true,
	},
	extends: ["standard-with-typescript"],
	rules: {
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/strict-boolean-expressions": "off",
		indent: "off",
		"@typescript-eslint/indent": ["error", "tab"],
		"no-tabs": "off",
		quotes: "off",
		"@typescript-eslint/quotes": ["error", "double"],
		semi: "off",
		"@typescript-eslint/semi": ["error", "always"],
		"comma-dangle": "off",
		"@typescript-eslint/comma-dangle": ["error", "always-multiline"],
		"space-before-function-paren": "off",
		"@typescript-eslint/space-before-function-paren": ["error", "always"],
	},
}
