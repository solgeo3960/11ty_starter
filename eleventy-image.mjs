import Image from "@11ty/eleventy-img";
import path from "node:path";

/** @param {number} layoutWidth */
export function retinaWidths(layoutWidth) {
	const w = Math.round(Number(layoutWidth));
	if (!w || w <= 0) return ["auto"];
	return [...new Set([w, w * 2])].sort((a, b) => a - b);
}

/** @param {string} assetPath */
export function resolveImageSrc(assetPath) {
	const normalized = assetPath.replace(/^\//, "");
	return path.join("src", normalized);
}

/**
 * @param {import("@11ty/eleventy-img").Metadata} metadata
 * @param {string} [media]
 * @param {string} sizes
 */
export function buildSourceTags(metadata, media, sizes) {
	const formatOrder = ["avif", "webp"];
	const autoFormat = metadata.png?.length ? "png" : metadata.jpeg?.length ? "jpeg" : null;
	const formats = autoFormat ? [...formatOrder, autoFormat] : formatOrder;
	const mediaAttr = media ? ` media="${media}"` : "";

	return formats
		.filter((format) => metadata[format]?.length)
		.map((format) => {
			const srcset = metadata[format].map((entry) => `${entry.url} ${entry.width}w`).join(", ");
			const mime = format === "jpeg" ? "image/jpeg" : `image/${format}`;
			return `<source${mediaAttr} type="${mime}" srcset="${srcset}" sizes="${sizes}">`;
		})
		.join("\n          ");
}

/**
 * @param {import("@11ty/eleventy-img").Metadata} metadata
 */
export function pickFallbackEntry(metadata) {
	for (const format of ["jpeg", "png", "webp", "avif"]) {
		const entries = metadata[format];
		if (entries?.length) return entries[0];
	}
	return null;
}

/**
 * @param {string} src
 * @param {number} layoutWidth
 * @param {import("@11ty/eleventy-img").ImageOptions} baseOptions
 */
export async function optimizeImage(src, layoutWidth, baseOptions) {
	return Image(resolveImageSrc(src), {
		widths: retinaWidths(layoutWidth),
		formats: ["avif", "webp", "auto"],
		...baseOptions,
	});
}
