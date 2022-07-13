export default function Icon({ svg, children, color = 'white', style, ...props }) {
	if (!svg && !children) return null;
	return (
		<span
			className={`block h-4 w-4`}
			style={{
				display: 'inline-block',
				verticalAlign: 'middle',
				fill: color,
				color: color,
				...style,
			}}
			{...props}
			dangerouslySetInnerHTML={{ __html: svg || children }}
		/>
	);
}
