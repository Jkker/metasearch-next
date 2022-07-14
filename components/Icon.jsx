import { useTheme } from 'next-themes';
import { ClientOnly } from '.';

function lightness(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	const r = parseInt(result[1], 16) / 255;
	const g = parseInt(result[2], 16) / 255;
	const b = parseInt(result[3], 16) / 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	const l = (max + min) / 2;
	return l;
}

export default function Icon({ svg, children, color = '0xffffff', style, ...props }) {
	const { theme } = useTheme();
	if (!svg && !children)
	return null;
	const dark = theme === 'dark';
	const l = lightness(color);
	const newColor = l < 0.2 && dark ? '#fff' : color;
	return (
		<ClientOnly>
			<span
				className={`h-4 w-4 text-white dark:text-white fill-white flex-center align-middle`}
				style={{
					fill: newColor,
					color: newColor,
					...style,
				}}
				{...props}
			>
				{svg || children}
			</span>
		</ClientOnly>
	);
}
