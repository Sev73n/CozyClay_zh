import { useEffect, useRef, useState } from "react";
import { getAnalyticsOptOut, setAnalyticsOptOut } from "./analytics.js";
import { LOCALE, ko, localeChosen, setLocale } from "./locale.js";

// App settings — language and analytics — behind one labelled topbar trigger
// (#193, docs/studio-ui-ia.md R4). Neither item edits the document, so they do
// not belong on the Save/Export row as bare toggles.
//
// The panel is a group of toggle buttons rather than role="menu": aria-pressed
// is the state contract the analytics opt-out already shipped with, and only
// role="button" supports it. Tab order is DOM order, Escape returns focus to
// the trigger.
const LANGUAGES = [
	{ id: "zh", label: "中文", action: "切换到中文" },
	{ id: "en", label: "English", action: "Switch to English" },
	{ id: "ko", label: "한국어", action: "한국어로 전환" },
];

export default function SettingsMenu() {
	const [open, setOpen] = useState(false);
	const [optedOut, setOptedOut] = useState(getAnalyticsOptOut);
	const triggerRef = useRef(null);

	// Dismissal mirrors the project menu: listen only while open, ignore
	// presses inside the wrap so the trigger keeps toggling, close on Escape
	// and hand focus back to the control the operator came from.
	useEffect(() => {
		if (!open) return undefined;
		const onPointerDown = (event) => {
			if (event.target instanceof Element && event.target.closest(".settings-menu-wrap")) return;
			setOpen(false);
		};
		const onKeyDown = (event) => {
			if (event.key !== "Escape") return;
			setOpen(false);
			triggerRef.current?.focus();
		};
		document.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	// First-run cue: until a language is stored, a ko-* / zh-* browser sees
	// the trigger in that language so the Settings menu is findable.
	const navLang = typeof navigator !== "undefined" ? (navigator.language ?? "") : "";
	const firstRunCue = !localeChosen && navLang.startsWith("ko")
		? "한국어"
		: !localeChosen && navLang.startsWith("zh")
			? "中文"
			: null;
	const label = firstRunCue ?? ko("Settings", "설정", "设置");

	return (
		<div className="settings-menu-wrap">
			<button
				type="button"
				className="topbar-action settings-menu-trigger"
				data-testid="settings-menu-trigger"
				aria-expanded={open}
				aria-haspopup="true"
				title={ko("Language and analytics", "언어 및 사용 통계", "语言与统计")}
				ref={triggerRef}
				onClick={() => setOpen((value) => !value)}
			>
				{label}
				<span className="caret">▾</span>
			</button>
			{open && (
				<div className="project-menu settings-menu" role="group" aria-label={ko("Settings", "설정", "设置")}>
					<h4>{ko("Language", "언어", "语言")}</h4>
					{LANGUAGES.map((language) => (
						<button
							key={language.id}
							type="button"
							data-testid={`settings-locale-${language.id}`}
							aria-pressed={LOCALE === language.id}
							title={language.action}
							onClick={() => setLocale(language.id)}
						>
							{language.label}
							<span className="mark" aria-hidden="true">{LOCALE === language.id ? "✓" : ""}</span>
						</button>
					))}
					<h4>{ko("Privacy", "개인정보", "隐私")}</h4>
					<button
						type="button"
						data-testid="settings-analytics"
						aria-pressed={!optedOut}
						title={optedOut
							? ko("Turn anonymous analytics on", "익명 사용 통계 켜기", "打开匿名统计")
							: ko("Turn anonymous analytics off", "익명 사용 통계 끄기", "关闭匿名统计")}
						onClick={async () => {
							const actual = await setAnalyticsOptOut(!optedOut);
							setOptedOut(actual);
						}}
					>
						{ko("Anonymous analytics", "익명 사용 통계", "匿名统计")}
						<span className="mark">{optedOut ? ko("off", "끔", "关") : ko("on", "켬", "开")}</span>
					</button>
					{/* Learning the camera is not a document edit and not a topbar
					    button (R4): the tutorial opens from this closed popover, so the
					    mode budgets in docs/studio-ui-ia.md §1 are untouched. */}
					<h4>{ko("Help", "도움말", "帮助")}</h4>
					<button
						type="button"
						data-testid="settings-camera-tutorial"
						title={ko("Learn the camera in seven steps", "일곱 단계로 카메라 익히기", "七步学会摄像机")}
						onClick={() => {
							window.dispatchEvent(new CustomEvent("cozyclay:camera-tutorial", { detail: { open: true } }));
							setOpen(false);
						}}
					>
						{ko("Camera tutorial", "카메라 튜토리얼", "摄像机教程")}
					</button>
				</div>
			)}
		</div>
	);
}
