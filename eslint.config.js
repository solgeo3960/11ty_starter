import htmlPlugin from "@html-eslint/eslint-plugin";

export default [
	{
		...htmlPlugin.configs["flat/recommended"],
		files: ["_site/**/*.html"],
		rules: {
			"@html-eslint/indent": "off",
			"@html-eslint/attrs-newline": "off",
			"@html-eslint/element-newline": "off",
			"@html-eslint/quotes": "off",
			"@html-eslint/no-extra-spacing-attrs": "off",
			"@html-eslint/require-closing-tags": "off",
		},
	},
];
