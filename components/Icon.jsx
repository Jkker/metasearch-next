export default function Icon({ children, color = '#ffffff' }) {
	if (typeof children === 'string')
		return (
			<span
				className={`h-4 w-4 text-white dark:text-white fill-white flex-center align-middle`}
				style={{
					fill: color,
					color: color,
				}}
				dangerouslySetInnerHTML={{ __html: children }}
			/>
		);
	else
		return (
			<span
				className={`h-4 w-4 text-white dark:text-white fill-white flex-center align-middle`}
				style={{
					fill: color,
					color: color,
				}}
			>
				{children}
			</span>
		);
}
