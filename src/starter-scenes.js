import { ko } from "./locale.js";

// Starter scenes ship inside the build (public/scenes/) so `npx cozyclay`
// can open the same set the landing-page playground uses. The landing page
// and the launcher refer to them by id; the studio resolves the id to the
// same-origin file.

export const STARTER_SCENES = Object.freeze([
	Object.freeze({
		id: "city-block",
		name: ko("City Block", "시티 블록", "城市街区"),
		blurb: ko(
			"The set from the cozyclay.org tutorial: an alley, parked cars, one character mid-walk.",
			"cozyclay.org 튜토리얼 세트: 골목, 주차된 차, 걷는 중인 인물 하나.",
			"来自 cozyclay.org 教程的场景：一条巷子、停着的车、一个走着的人。",
		),
	}),
]);

export function starterSceneById(id) {
	return STARTER_SCENES.find((scene) => scene.id === id) ?? null;
}

/** `?scene=` accepts a starter id or a same-origin path. */
export function resolveSceneParam(value) {
	if (typeof value !== "string" || !value) return null;
	const starter = starterSceneById(value);
	if (starter) return `/scenes/${starter.id}.cclayproject`;
	if (value.startsWith("/") && !value.startsWith("//")) return value;
	return null;
}
