import cx from 'clsx';
import { forwardRef, useRef, useState } from 'react';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { TiDelete } from 'react-icons/ti';
import { Fade } from '../components';
import Rotate from '../components/Rotate';

const URL = '/api/complete?q=';

const AutoComplete = ({ onSubmit, value, onChange, leftAction, ...inputProps }, ref) => {
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
			// console.log(`🚀 getAutoSuggest`, value, newData);
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
		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault();
				setActiveIndex((activeIndex) => {
					const nextIndex = Math.min(activeIndex + 1, options.length - 1);
					onChange(options[nextIndex]);
					return nextIndex;
				});
				break;
			}
			case 'ArrowUp': {
				e.preventDefault();
				setActiveIndex((activeIndex) => {
					const nextIndex = Math.max(activeIndex - 1, -1);
					onChange(options[nextIndex]);
					return nextIndex;
				});
				break;
			}
			case 'Enter': {
				e.preventDefault();
				if (activeIndex > -1) {
					const value = options[activeIndex];
					handleSelect(value);
				} else {
					handleSubmit(e.target.value);
				}
				break;
			}
			case 'Escape': {
				e.preventDefault();
				ref.current.blur();
				break;
			}
		}
	};

	const handleClose = () => setOpen(false);

	const validOpen = open && options && options.length;

	return (
		<div className='relative w-full' ref={containerRef}>
			<input
				aria-autocomplete='both'
				aria-controls='autocomplete-listbox'
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
					'acrylic flex-col w-screen absolute top-9 z-30 border-t-gray-200 dark:border-t-gray-600 drop-shadow-2xl overflow-hidden transition-all ease-in-out duration-100 bg-white/60 dark:bg-gray-700/50',
					validOpen ? ' border-t h-auto' : 'h-0'
				)}
				role='listbox'
				aria-label='Autocomplete Suggestions'
				id='autocomplete-listbox'
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
						onClick={() => {
							handleSelect(option);
						}}
						role='option'
						aria-selected={activeIndex === index}
					>
						<span className='h-9 w-9 flex-center shrink-0'>
							<FiSearch />
						</span>
						{option}
					</button>
				))}
			</div>
			<button
				className='absolute top-0 left-0 h-9 w-9 flex-center'
				onClick={validOpen ? handleClose : leftAction}
				title={validOpen ? 'Close' : 'Search'}
			>
				<Rotate show={validOpen}>
					<FiArrowLeft />
					<FiSearch />
				</Rotate>
			</button>
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
