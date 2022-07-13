import { Tab } from '@headlessui/react';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { FiSearch, FiX } from 'react-icons/fi';
import Icon from '../components/Icon';
import LoadingIcon from '../components/LoadingIcon';
import engines from '../data/engine';

const iFrameProps = {
	width: '100%',
	height: '100%',
	frameBorder: '0',
	loading: 'eager',
	referrerPolicy: 'no-referrer',
	sandbox:
		'allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation',
};
const processUrl = (url, key) => url.replace(/%s/g, encodeURIComponent(key));

const SiteStates = {
	INIT: 'Init',
	LOADING: 'Loading',
	READY: 'Loaded',
};
const { INIT, LOADING, READY } = SiteStates;

export default function Search() {
	const router = useRouter();
	const TabListRef = useRef(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [initialLoad, setInitialLoad] = useState(false);
	const [dark, setIsDarkMode] = useState(false);

	const data = engines.map(({ title, ...item }, index) => ({
		title,
		display: cx(
			item.mobile === false && 'hidden sm:flex',
			item.desktop === false && 'flex sm:hidden'
		),
		state: item.preload ? LOADING : INIT,
		...item,
	}));

	const [tabState, setTabState] = useState(data.map(({ state }) => state));

	const [query, setQuery] = useState('');

	const onSearch = async (value) => {
		setQuery(value);
		console.log(value);
		router.push({ pathname: router.pathname, query: { q: value } }, undefined, {
			shallow: true,
		});
	};

	const onEngineChange = (index) => {
		setSelectedIndex(index);
		setTabState((prev) => {
			console.log('🌟', index, prev[index] === INIT ? LOADING : prev[index]);
			return {
				...prev,
				[index]: prev[index] === INIT ? LOADING : prev[index],
			};
		});
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const query = params.get('q');
		if (query) {
			setQuery(query);
		}
		setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);

		document.getElementById('search-input').focus();
	}, []);

	return (
		<div className='flex flex-col h-screen'>
			<div className='input-bar relative'>
				<DebounceInput
					minLength={1}
					debounceTimeout={800}
					value={query}
					onChange={(event) => onSearch(event.target.value)}
					className={cx('w-full h-10 p-2 pl-9 ')}
					id='search-input'
				/>
				<button
					className='absolute top-0 left-0 h-10 w-9 flex-center'
					onClick={(e) => {
						if (query) {
							document.getElementById(`frame-${selectedIndex}`).src += '';
						}
					}}
				>
					<FiSearch />
				</button>
				<button
					className='absolute top-0 right-0 h-10 w-9 flex-center'
					onClick={() => setQuery('')}
				>
					<FiX />
				</button>
			</div>
			<Tab.Group selectedIndex={selectedIndex} onChange={onEngineChange}>
				<div className='tab-list flex w-full justify-between bg-gray-100 dark:bg-gray-800'>
					<Tab.List
						className='flex drop-shadow-lg max-w-screen overflow-x-scroll scrollbar-hide'
						ref={TabListRef}
						onWheel={(e) => {
							if (e.deltaY == 0) return;
							TabListRef.current.scrollTo({
								left: TabListRef.current.scrollLeft + e.deltaY,
								behavior: 'smooth',
							});
						}}
					>
						{data.map(({ icon, color, title, body, display, preload, ...item }, index) => (
							<Tab key={index} as={Fragment}>
								{({ selected }) => (
									<button
										className={cx(
											'box-border flex items-center whitespace-nowrap h-9 min-w-[36px] sm:min-w-fit px-[10px]',
											'transition-all duration-200 ease-in-out',
											'bg-white dark:bg-gray-800',
											'hover:shadow-lg hover:brightness-95 dark:hover:brightness-125',
											'active:brightness-90 dark:active:brightness-125',
											'focus:outline-none focus-visible:brightness-90 dark:focus-visible:brightness-110',
											'border-b-[2px] ',
											selected && 'text-white shadow-inner',
											display
										)}
										style={{
											borderColor: color,
											backgroundColor: selected ? color : undefined,
										}}
										onMouseDown={(e) => {
											if (selectedIndex === index && query) {
												document.getElementById(`frame-${index}`).src += '';
												console.log('🍉 refresh', title);
											}
										}}
									>
										<>
											{tabState[index] === LOADING && query && (
												<span className='absolute t-0 r-0'>
													<LoadingIcon
														className={cx(
															selected ? 'text-white' : 'text-gray-500 dark:text-white',
															''
														)}
													/>
												</span>
											)}

											<Icon dark={dark} color={selected ? '#ffffff' : color}>
												{icon}
											</Icon>
										</>
										<span className='hidden sm:inline sm:ml-2'>{title}</span>
									</button>
								)}
							</Tab>
						))}
					</Tab.List>
					{/* <Menu /> */}
				</div>
				<Tab.Panels className='tab-panes flex h-full'>
					<Tab.Panel
						className={cx('max-w-screen overflow-auto w-full', data[0].display)}
						key={0}
						static
						style={{
							display: selectedIndex === 0 ? 'block' : 'none',
						}}
					>
						{query && (
							<iframe
								{...iFrameProps}
								id='frame-0'
								title={data[0].title}
								src={processUrl(data[0].url, query)}
								key={data[0].title}
								onLoad={(e) => {
									setInitialLoad(true);
									setTabState((prev) => ({ ...prev, 0: true }));
								}}
							/>
						)}
					</Tab.Panel>
					{data
						.slice(1, data.length)
						.map(({ preload, icon, title, url, body, display, ...item }, idx) => {
							const index = idx + 1;
							const isSelected = selectedIndex === index;
							return (
								<Tab.Panel
									className={cx('max-w-screen overflow-auto w-full', display)}
									key={index}
									style={{
										display: isSelected ? 'block' : 'none',
									}}
									static
								>
									{query && initialLoad && (isSelected || preload) && (
										<iframe
											id={`frame-${index}`}
											title={title}
											loading={preload ? 'eager' : 'lazy'}
											src={processUrl(url, query)}
											key={title}
											{...iFrameProps}
											onLoad={(e) => {
												console.log('🌟', title, 'Loaded');
												setTabState((prev) => ({ ...prev, [index]: READY }));
											}}
										/>
									)}
								</Tab.Panel>
							);
						})}
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
}

function Panel({ icon, title, url, body, display, index, show, ...item }) {
	return (
		<Tab.Panel
			className={cx('max-w-screen overflow-auto w-full', display)}
			key={index + 1}
			style={{
				display: show ? 'block' : 'none',
				// visibility: selectedIndex === index + 1 ? 'visible' : 'hidden',
			}}
			static
		>
			{query && initialLoad && (
				<iframe
					title={title}
					src={processUrl(url, query)}
					key={title}
					{...iFrameProps}
					onLoad={(e) => {
						console.log('🌟', title, 'Loaded');
					}}
				/>
			)}
		</Tab.Panel>
	);
}
