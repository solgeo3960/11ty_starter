import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import {
	buildSourceTags,
	optimizeImage,
	pickFallbackEntry,
} from "./eleventy-image.mjs";

const pathPrefix = "/shuto/kawagoe/";
const isServe = process.env.ELEVENTY_RUN_MODE === "serve";

/** @type {import("@11ty/eleventy-img").ImageOptions} */
const imageBaseOptions = {
	urlPath: `${pathPrefix}assets/images/`,
	outputDir: "./_site/assets/images/",
	transformOnRequest: isServe,
};

// pathPrefix 利用時、デフォルトの /.11ty/image/ は 404 になるため補正する
if (isServe) {
	imageBaseOptions.urlFormat = ({ src, width, format }) => {
		return `${pathPrefix}.11ty/image/?src=${encodeURIComponent(String(src))}&width=${width}&format=${format}`;
	};
}

/**
 * @param {import("@11ty/eleventy-img").Metadata} metadata
 */
function buildImgSrcset(metadata) {
	for (const format of ["webp", "jpeg", "png"]) {
		const entries = metadata[format];
		if (entries?.length) {
			return entries.map((entry) => `${entry.url} ${entry.width}w`).join(", ");
		}
	}
	return "";
}

/**
 * PC / SP 別ソース + retina 対応の `<picture>` を生成する。
 *
 * @param {{ pc: string, sp: string, alt?: string, width: number, height: number, spWidth?: number, sizes?: string, spSizes?: string, class?: string, attrs?: string }} options
 */
async function responsivePicture(options) {
	const {
		pc,
		sp,
		alt = "",
		width,
		height,
		spWidth = width,
		sizes = "100vw",
		spSizes = "100vw",
		class: className,
		attrs = "",
	} = options;

	const [pcMeta, spMeta] = await Promise.all([
		optimizeImage(pc, width, imageBaseOptions),
		optimizeImage(sp, spWidth, imageBaseOptions),
	]);

	const spMedia = "(max-width: 767px)";
	const spSources = buildSourceTags(spMeta, spMedia, spSizes);
	const pcSources = buildSourceTags(pcMeta, "", sizes);
	const fallback = pickFallbackEntry(pcMeta);
	const imgSrcset = buildImgSrcset(pcMeta);

	if (!fallback) {
		throw new Error(`responsivePicture: could not optimize ${pc}`);
	}

	const classAttr = className ? ` class="${className}"` : "";
	const srcsetAttr = imgSrcset ? ` srcset="${imgSrcset}"` : "";
	const pictureOpen = `<picture${classAttr}${attrs ? ` ${attrs}` : ""}>`;

	return `${pictureOpen}
          ${spSources}
          ${pcSources}
          <img src="${fallback.url}" alt="${alt}" width="${width}" height="${height}" sizes="${sizes}" decoding="async"${srcsetAttr}>
        </picture>`;
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
	eleventyConfig.addPassthroughCopy("src/assets/js");
	eleventyConfig.addPassthroughCopy("src/assets/css");
	eleventyConfig.addPassthroughCopy("src/assets/font");
	eleventyConfig.addPassthroughCopy("src/assets/favicon.svg");
	/** CSS background-image 用（eleventy-img 対象外） */
	eleventyConfig.addPassthroughCopy("src/assets/images/fv/sp_bg.png");
	eleventyConfig.addPassthroughCopy({
		"node_modules/gsap/dist/gsap.min.js": "assets/js/vendor/gsap.min.js",
		"node_modules/gsap/dist/ScrollTrigger.min.js": "assets/js/vendor/ScrollTrigger.min.js",
	});

	eleventyConfig.addAsyncShortcode("responsivePicture", responsivePicture);
	eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin, imageBaseOptions);

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
	/** staging: https://pretest.sumitomo-rd-mansion.jp/shuto/kawagoe/ */
	pathPrefix: "/shuto/kawagoe/",
};
