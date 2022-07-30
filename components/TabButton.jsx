import cx from 'clsx';
import { useTheme } from 'next-themes';
import { forwardRef } from 'react';
import { ClientOnly, Fade, Icon, LoadingIcon } from '.';

function Button(
	{
		icon,
		lightness,
		color,
		name,
		display,
		selected,
		loading,
		onDoubleClick,
		onMouseDown,
		onClick,
		onMouseUp,
	},
	ref
) {
	const { theme, resolvedTheme } = useTheme();
	const dark = theme === 'dark' || resolvedTheme === 'dark';
	const newColor = lightness < 0.2 && dark ? '#fff' : color;
	return (
		<ClientOnly>
			<button
				ref={ref}
				className={cx(
					'box-border flex items-center whitespace-nowrap h-9 min-w-[36px] sm:min-w-fit px-[10px] sm:px-1 md:px-2 lg:px-3',
					'transition-all duration-200 ease-in-out',
					'bg-white dark:bg-gray-800',
					selected ? 'text-white' : 'text-black dark:text-gray-50',
					'hover:shadow-lg hover:brightness-95',
					selected ? 'dark:hover:brightness-110' : 'dark:hover:brightness-125',
					'active:brightness-90 dark:active:brightness-125',
					'border-b-[2px]',
					{
						'shadow-inner': selected,
					},
					display
				)}
				style={{
					borderColor: newColor,
					backgroundColor: selected ? color : undefined,
				}}
				title={'Search ' + name}
				onDoubleClick={onDoubleClick}
				onMouseDown={onMouseDown}
				onMouseUp={onMouseUp}
				onClick={onClick}
			>
				<span className='absolute t-0 r-0'>
					<Fade show={loading}>
						<LoadingIcon
							className={cx(selected ? 'text-white' : 'text-gray-500 dark:text-white')}
						/>
					</Fade>
				</span>
				<Icon color={selected ? '#fff' : newColor}>{icon}</Icon>
				<span className='hidden md:flex md:ml-2 whitespace-nowrap items-center'>{name}</span>
			</button>
		</ClientOnly>
	);
}

export default forwardRef(Button);
