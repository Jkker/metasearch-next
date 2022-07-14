import { Tab } from '@headlessui/react';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { FiSearch } from 'react-icons/fi';
import { TiDelete } from 'react-icons/ti';
import { Fade, Icon, LoadingIcon, Menu, ThemeSwitch } from '../components';
import dbConnect from '../lib/dbConnect';
import Engine from '../models/Engine';
const { renderToString } = require('react-dom/server');

const isValidXml = (xml) => xml.includes('</svg>');

export const getStaticProps = async () => {
	await dbConnect();
	const engines = await Engine.find({});

	const reactIcons = await import('../node_modules/react-icons/all.js');
	const localIcons = await import('../components/SiteIcons.jsx');
	return {
		props: {
			engines: JSON.parse(JSON.stringify(engines)).map(({ icon = 'IoGlobeOutline', ...engine }) => {
				if (isValidXml(icon))
					return {
						...engine,
						icon,
					};

				const iconElement = reactIcons[icon] || localIcons[icon] || reactIcons['IoGlobeOutline'];
				return {
					...engine,
					icon: renderToString(iconElement()),
				};
			}),
		},
		revalidate: 60,
	};
};

const iFrameProps = {
	width: '100%',
	height: '100%',
	frameBorder: '0',
	loading: 'eager',
	referrerPolicy: 'no-referrer',
	sandbox:
		'allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation',
};

const tabButtonStyles = cx(
	'box-border flex items-center whitespace-nowrap h-9 min-w-[36px] sm:min-w-fit px-[10px]',
	'transition-all duration-200 ease-in-out',
	'bg-white dark:bg-gray-800',
	'hover:shadow-lg hover:brightness-95 dark:hover:brightness-125',
	'active:brightness-90 dark:active:brightness-125',
	'focus:outline-none focus-visible:brightness-90 dark:focus-visible:brightness-110',
	'border-b-[2px]'
);

const processUrl = (url, key) => url.replace(/%s/g, encodeURIComponent(key));

const SiteStates = {
	INIT: 0,
	LOADING: 1,
	READY: 2,
};
const { INIT, LOADING, READY } = SiteStates;

export default function Search({ engines }) {
	const router = useRouter();
	const TabListRef = useRef(null);
	const inputRef = useRef(null);
	const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [query, setQuery] = useState('');

	const data = engines.map(({ name, ...item }) => ({
		name,
		display: cx(
			item.mobile === false && 'hidden sm:flex',
			item.desktop === false && 'flex sm:hidden'
		),
		state: item.preload ? LOADING : INIT,
		...item,
	}));

	const [tabState, setTabState] = useState(data.map(({ state }) => state));

	const onSearch = async (value) => {
		setQuery(value);
		router.push({ pathname: router.pathname, query: { q: value } }, undefined, {
			shallow: true,
		});
		if (value.length > 0) {
			inputRef.current.blur();
		}
	};

	const onEngineChange = (index) => {
		setSelectedIndex(index);
		setTabState((prev) => {
			return {
				...prev,
				[index]: prev[index] === INIT ? LOADING : prev[index],
			};
		});
	};

	useEffect(() => {
		// Get search query from url
		const params = new URLSearchParams(window.location.search);
		const q = params.get('q');
		if (q) setQuery(q);
		if (!q) inputRef.current.focus();
	}, []);

	return (
		<main className='flex flex-col h-screen'>
			<Tab.Group selectedIndex={selectedIndex} onChange={onEngineChange}>
				<header>
					<nav className='input-bar flex'>
						<DebounceInput
							minLength={1}
							inputRef={inputRef}
							debounceTimeout={800}
							value={query}
							onChange={(event) => onSearch(event.target.value)}
							className='w-full h-9 p-2 pl-9 bg-white dark:bg-gray-700'
							id='search-input'
						/>
						<button
							className='absolute top-0 left-0 h-9 w-9 flex-center'
							onClick={(e) => {
								if (query) {
									document.getElementById(`frame-${selectedIndex}`).src += '';
								}
							}}
							title='Search'
						>
							<FiSearch />
						</button>
						<Fade show={query.length > 0}>
							<button
								className='absolute top-0 right-9 h-9 w-9 flex-center opacity-50'
								onClick={() => onSearch('')}
								title='Clear search'
							>
								<TiDelete />
							</button>
						</Fade>

						<Menu>
							<ThemeSwitch />
						</Menu>
					</nav>
					<Tab.List
						className='flex w-full justify-start bg-gray-100 dark:bg-gray-800 drop-shadow-lg max-w-screen overflow-x-scroll scrollbar-hide'
						ref={TabListRef}
						onWheel={(e) => {
							// Convert vertical scroll to horizontal scroll
							if (e.deltaY == 0) return;
							TabListRef.current.scrollTo({
								left: TabListRef.current.scrollLeft + e.deltaY,
								behavior: 'smooth',
							});
						}}
						as='nav'
					>
						{data.map(({ icon, color, name, display }, index) => (
							<Tab key={index} as={Fragment}>
								{({ selected }) => (
									<button
										className={cx(tabButtonStyles, selected && 'text-white shadow-inner', display)}
										style={{
											borderColor: color,
											backgroundColor: selected ? color : undefined,
										}}
										onMouseDown={(e) => {
											// Reload the page if the user clicks the same engine twice
											if (selectedIndex === index && query) {
												document.getElementById(`frame-${index}`).src += '';
											}
										}}
										title={'Search ' + name}
									>
										<>
											<span className='absolute t-0 r-0'>
												<Fade show={tabState[index] === LOADING && query}>
													<LoadingIcon
														className={cx(
															selected ? 'text-white' : 'text-gray-500 dark:text-white'
														)}
													/>
												</Fade>
											</span>
											<Icon color={selected ? '#ffffff' : color}>{icon}</Icon>
										</>
										<span className='hidden sm:inline sm:ml-2'>{name}</span>
									</button>
								)}
							</Tab>
						))}
					</Tab.List>
				</header>
				<Tab.Panels className='flex tab-panes h-full'>
					<Tab.Panel
						className={cx('w-full', data[0].display)}
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
								title={data[0].name}
								src={processUrl(data[0].url, query)}
								key={data[0].name}
								onLoad={() => {
									setFirstFrameLoaded(true);
									setTabState((prev) => ({ ...prev, 0: true }));
								}}
							/>
						)}
					</Tab.Panel>
					{data.slice(1, data.length).map(({ preload, name, url, display }, prevIndex) => {
						const index = prevIndex + 1;
						const isSelected = selectedIndex === index;
						return (
							<Tab.Panel
								className={cx('w-full', display)}
								key={index}
								style={{
									display: isSelected ? 'block' : 'none',
								}}
								static
							>
								{query && firstFrameLoaded && (isSelected || preload) && (
									<iframe
										{...iFrameProps}
										id={`frame-${index}`}
										title={name}
										key={name}
										loading={preload ? 'eager' : 'lazy'}
										src={processUrl(url, query)}
										onLoad={() => {
											setTabState((prev) => ({ ...prev, [index]: READY }));
										}}
									/>
								)}
							</Tab.Panel>
						);
					})}
				</Tab.Panels>
			</Tab.Group>
		</main>
	);
}
