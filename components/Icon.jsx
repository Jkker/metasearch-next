function isDarkColor(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	const r = parseInt(result[1], 16) / 255;
	const g = parseInt(result[2], 16) / 255;
	const b = parseInt(result[3], 16) / 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	const l = (max + min) / 2;
	return l < 0.2;
}

export default function Icon({ dark = false, svg, children, color = '0xffffff', style, ...props }) {
	if (!svg && !children) return null;
	// const colorHex = parseInt(color.replace('#', ''), 16);
	// const dark = colorHex <= 0x181717;
	const newColor = isDarkColor(color) && dark ? '#fff' : color;
	return (
		<span
			className={`h-4 w-4 text-white dark:text-white fill-white flex-center align-middle`}
			style={{
				fill: newColor,
				color: newColor,
				...style,
			}}
			{...props}
			// dangerouslySetInnerHTML={{ __html: svg || children }}
		>
			{svg || children}
		</span>
	);
}
