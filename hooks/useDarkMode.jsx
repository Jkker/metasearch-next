import { useState, useEffect } from 'react';

export default function useDarkMode() {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const m = window.matchMedia('(prefers-color-scheme: dark)').matches;
		setIsDarkMode(m);
	}, []);
	return isDarkMode;
}
