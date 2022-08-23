import cx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { TiDelete } from 'react-icons/ti';
import { Fade } from '../components';

const URL = '/api/complete?q=';

const AutoComplete = ({ onSubmit, value, onChange, ...inputProps }, ref) => {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [data, setData] = useState([undefined, []]);
	const options = data[1];
	const timer = useRef();
	const containerRef = useRef(null);

	const reloadSuggestions = async (value) => {
		if (value === data[0]) return;
		if (value.length > 0) {
			const response = await fetch(URL + encodeURIComponent(value));
			const newData = await response.json();
			setData(newData);
			console.log(`🚀 getAutoSuggest`, value, newData);
		} else {
			setData([undefined, []]);
		}
	};

	const debouncedReloadSuggestions = async (value) => {
		clearTimeout(timer.current);
		timer.current = setTimeout(async () => {
			await reloadSuggestions(value);
		}, 500);
	};

	const handleInputChange = (event) => {
		const value = event.target.value;
		setActiveIndex(-1);
		onChange(value);
		debouncedReloadSuggestions(value);
	};

	const handleInputFocus = (event) => {
		debouncedReloadSuggestions(event.target.value);
		setOpen(true);
	};

	const handleSubmit = (value) => {
		onSubmit(value);
		setOpen(false);
		setActiveIndex(-1);
	};

	const handleSelect = (value) => {
		onChange(value);
		handleSubmit(value);
		reloadSuggestions(value);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setActiveIndex((activeIndex) => {
				const nextIndex = Math.min(activeIndex + 1, options.length - 1);
				onChange(options[nextIndex]);
				return nextIndex;
			});
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setActiveIndex((activeIndex) => {
				const nextIndex = Math.max(activeIndex - 1, -1);
				onChange(options[nextIndex]);
				return nextIndex;
			});
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (activeIndex > -1) {
				const value = options[activeIndex];
				handleSelect(value);
			} else {
				handleSubmit(e.target.value);
			}
		}
	};

	return (
		<div className='relative w-full' ref={containerRef}>
			<input
				aria-autocomplete='both'
				autoCapitalize='off'
				autoComplete='off'
				autoCorrect='off'
				spellCheck='false'
				{...inputProps}
				value={value}
				ref={ref}
				onChange={handleInputChange}
				onFocus={handleInputFocus}
				onKeyDown={handleKeyDown}
				onBlur={() =>
					setTimeout(() => {
						const outside =
							!document.activeElement || !containerRef.current.contains(document.activeElement);
						if (outside) {
							setOpen(false);
							setActiveIndex(-1);
						}
					})
				}
			/>

			<div
				className={cx(
					'acrylic flex-col w-screen absolute top-9 z-10 border-t-gray-200 dark:border-t-gray-600 drop-shadow-2xl overflow-hidden transition-all ease-in-out duration-100 bg-white/60 dark:bg-gray-700/50',
					open && options && options.length ? ' border-t h-auto' : 'h-0'
				)}
			>
				{options.map((option, index) => (
					<button
						className={cx(
							'flex w-full text-left pr-2  text-gray-700 dark:text-white/90 items-center',

							activeIndex === index
								? 'bg-gray-400/20 dark:bg-gray-300/30'
								: 'hover:bg-gray-400/20 dark:hover:bg-gray-300/30'
						)}
						key={option}
						value={option}
						// onMouseEnter={() => setActiveIndex(index)}
						onClick={() => {
							handleSelect(option);
						}}
					>
						<span className='h-9 w-9 flex-center shrink-0'>
							<FiSearch />
						</span>
						{option}
					</button>
				))}
			</div>
			<Fade show={value?.length}>
				<button
					className='absolute top-0 right-0 h-9 w-9 flex-center opacity-40'
					onClick={() => {
						onChange('');
						handleSubmit('');
					}}
					title='Clear search'
				>
					<TiDelete />
				</button>
			</Fade>
		</div>
	);
};

export default forwardRef(AutoComplete);
