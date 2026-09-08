import { useState } from "react";
import { getAnalyticsOptOut, setAnalyticsOptOut } from "./analytics.js";
import { ko } from "./locale.js";

export default function AnalyticsToggle() {
	const [optedOut, setOptedOut] = useState(getAnalyticsOptOut);
	const label = optedOut ? ko("Analytics off", "측정 끔", "统计已关") : ko("Analytics on", "측정 켬", "统计已开");
	const nextLabel = optedOut ? ko("Turn analytics on", "측정 켜기", "打开统计") : ko("Turn analytics off", "측정 끄기", "关闭统计");
	return (
		<button
			type="button"
			className="locale-toggle"
			title={nextLabel}
			aria-label={nextLabel}
			onClick={async () => {
				const next = !optedOut;
				const actual = await setAnalyticsOptOut(next);
				setOptedOut(actual);
			}}
		>
			{label}
		</button>
	);
}
