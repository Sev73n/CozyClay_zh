import { LOCALE, setLocale } from "./locale.js";

// One small header button: shows the language you would switch TO, so it
// reads as an action. Cycle: en → 한국어 → 中文 → en.
const CYCLE = {
	en: { next: "ko", label: "한국어", title: "한국어로 전환" },
	ko: { next: "zh", label: "中文", title: "切换到中文" },
	zh: { next: "en", label: "EN", title: "Switch to English" },
};

export default function LocaleToggle() {
	const action = CYCLE[LOCALE] ?? CYCLE.zh;
	return (
		<button
			type="button"
			className="locale-toggle"
			title={action.title}
			aria-label={action.title}
			onClick={() => setLocale(action.next)}
		>
			{action.label}
		</button>
	);
}
