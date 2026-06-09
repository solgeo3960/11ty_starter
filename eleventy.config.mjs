/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy({
		"node_modules/gsap/dist/gsap.min.js": "assets/js/vendor/gsap.min.js",
		"node_modules/gsap/dist/ScrollTrigger.min.js": "assets/js/vendor/ScrollTrigger.min.js",
	});

	/** テンプレートで `{{ value | debugDump }}` — 本番HTMLには出さないこと */
	eleventyConfig.addFilter("debugDump", function (value, spaces = 2) {
		try {
			return JSON.stringify(value, null, Number(spaces) || 2);
		} catch (err) {
			return `[debugDump: ${err?.message ?? err}]`;
		}
	});
}

export const config = {
	dir: {
		input: "src",
		includes: "_includes",
		data: "_data",
		output: "_site",
	},
};
