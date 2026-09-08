// Force English before any module that calls ko() at import/eval time.
// locale.js reads localStorage once at module load; Node tests have no
// browser storage, so without this the default is Chinese.
if (!Object.getOwnPropertyDescriptor(globalThis, "localStorage")) {
	const store = new Map([["cozyclay.locale", "en"]]);
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		value: {
			getItem: (key) => (store.has(key) ? store.get(key) : null),
			setItem: (key, value) => {
				store.set(key, String(value));
			},
			removeItem: (key) => {
				store.delete(key);
			},
		},
	});
} else {
	try {
		globalThis.localStorage.setItem("cozyclay.locale", "en");
	} catch {
		// ignore
	}
}
