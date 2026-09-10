// CozyClay UI locale. Chinese is the default; English and Korean are opt-in.
//
// Direction (i18n/zh): extend the official ko(en, ko) helper with an optional
// Chinese third argument. Settings ▾ lists all three languages. An explicit
// choice saved in localStorage wins. Without one, the UI starts in Chinese
// regardless of browser or operating-system language. The locale is fixed for
// the lifetime of the page — every label goes through ko() at render time, so
// switching saves the choice and reloads.
const KEY = "cozyclay.locale";
const LOCALES = new Set(["zh", "en", "ko"]);

function stored() {
	try {
		const value = localStorage.getItem(KEY);
		return LOCALES.has(value) ? value : null;
	} catch {
		return null;
	}
}

export const LOCALE = stored() ?? "zh";
export const isKo = LOCALE === "ko";
export const isZh = LOCALE === "zh";
// Whether the operator has ever picked a language. Upstream uses this so a
// Korean browser that has not chosen yet still sees a first-run cue on the
// Settings trigger (#193). We keep the same flag; the default locale is zh.
export const localeChosen = stored() !== null;

/** Pick the label for the active locale: ko("Frame", "프레임", "帧"). */
export function ko(en, koText, zhText) {
	if (isZh) return zhText ?? en;
	if (isKo) return koText;
	return en;
}

/** Pick from [en, ko, zh] by the active locale. */
export function pick(parts) {
	if (!parts) return undefined;
	if (isZh) return parts[2] ?? parts[0];
	if (isKo) return parts[1] ?? parts[0];
	return parts[0];
}

export function setLocale(next) {
	if (!LOCALES.has(next)) return;
	try {
		localStorage.setItem(KEY, next);
	} catch {
		// Private mode without storage: the toggle still works for this load.
	}
	window.location.reload();
}
