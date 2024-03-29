import { Switch } from '@headlessui/react';
import cx from 'clsx';
import { useTheme } from 'next-themes';
import { ClientOnly } from '.';
import { forwardRef } from 'react';

const ThemeIcon = ({ isDark, className = 'h-5 w-5' }) => (
	<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' className={className}>
		<g
			className={cx('nc-int-icon js-nc-int-icon nc-int-icon-rotate fill-current', {
				'nc-int-icon-state-b': !isDark,
			})}
		>
			<g className='nc-int-icon-a'>
				<path d='M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z'></path>
			</g>
			<g className='nc-int-icon-b'>
				<path d='M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z'></path>
			</g>
		</g>
	</svg>
);

function ThemeSwitch({ className = '', active, ...props }, ref) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const isDark = theme === 'dark' || resolvedTheme === 'dark';
	const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
	return (
		<ClientOnly>
			<Switch.Group as='div' className='flex gap-3 px-2 py-1 w-full justify-between items-center'>
				<Switch.Label>Dark</Switch.Label>
				<Switch
					checked={isDark}
					onChange={toggleTheme}
					className={`
          relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75 bg-gray-200 dark:bg-gray-500`}
				>
					<span className='sr-only'>theme switch</span>
					<span
						aria-hidden='true'
						className={`${isDark ? 'translate-x-5' : 'translate-x-0'}
            pointer-events-none h-4 w-4 transform rounded-full shadow-lg ring-0 transition duration-150 ease-in-out bg-gray-400 dark:bg-gray-300 text-gray-100 dark:text-gray-500 flex-center`}
					>
						<ThemeIcon isDark={!isDark} className='h-4 w-4' />
					</span>
				</Switch>
			</Switch.Group>
			{/* <button
				onClick={toggleTheme}
				className={cx(
					'whitespace-nowrap h-9 flex items-center justify-between w-full p-2',
					'transition-all duration-200 ease-in-out',
					'gap-3'
				)}
				title='Toggle theme'
				ref={ref}
				{...props}
			>
				<ThemeIcon isDark={isDark} />
				{isDark ? 'Light' : 'Dark'}
			</button> */}
		</ClientOnly>
	);
}

export default forwardRef(ThemeSwitch);
