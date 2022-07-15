export default function Switch({ checked, onChange, icon, label }) {
	return (
		<Switch.Group as='div' className='flex gap-3'>
			<Switch.Label>{label}</Switch.Label>
			<Switch
				checked={checked}
				onChange={onChange}
				className={`
          relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75 bg-gray-200 dark:bg-gray-500`}
			>
				<span className='sr-only'>{label}</span>
				<span
					aria-hidden='true'
					className={`${checked ? 'translate-x-6' : 'translate-x-0'}
            pointer-events-none h-5 w-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out bg-gray-400 dark:bg-gray-300 text-gray-100 dark:text-gray-500 flex-center`}
				>
					{/* <ThemeIcon isDark={!isDark} className='h-4 w-4' /> */}
					{icon}
				</span>
			</Switch>
		</Switch.Group>
	);
}
