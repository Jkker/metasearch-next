import { Tab } from '@headlessui/react';
import cx from 'classnames';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { isMobile } from 'react-device-detect';
import { FiSearch } from 'react-icons/fi';
import { TiDelete } from 'react-icons/ti';
import { Fade, Icon, LoadingIcon, Menu, ThemeSwitch } from '../components';
import dbConnect from '../lib/dbConnect';
import Engine from '../models/Engine';
import Head from 'next/head';

const SiteStates = {
	INIT: 0,
	LOADING: 1,
	READY: 2,
};
const { INIT, LOADING, READY } = SiteStates;

export const getStaticProps = async () => {
	const { renderToString } = require('react-dom/server');
	const isValidSvg = (str) => str.includes('</svg>');

	const ICON_PKG = [
		'ai',
		'bs',
		'di',
		'fc',
		'gi',
		'gr',
		'im',
		'si',
		'ti',
		'wi',
		'bi',
		'cg',
		'fa',
		'fi',
		'go',
		'hi',
		'io5',
		'md',
		'ri',
		'tb',
		'vsc',
	];

	await dbConnect();
	const engines = await Engine.find({});

	const icons = {};

	// Import react-icons
	for (const pkg of ICON_PKG) {
		const Icon = await import(`../node_modules/react-icons/${pkg}/index.js`);
		Object.assign(icons, Icon);
	}

	const localIcons = await import('../components/SiteIcons.jsx');
	Object.assign(icons, localIcons);

	const sorted = JSON.parse(JSON.stringify(engines)).sort((a, b) => {
		if (a.weight < b.weight) return 1;
		if (a.weight > b.weight) return -1;
		return a.name < b.name ? -1 : 1;
	});
	const hotkeys = sorted.reduce((acc, engine, index) => {
		const key = engine.key[0].toLowerCase();
		acc[key] = acc[key] ? [...acc[key], index] : [index];
		return acc;
	}, {});

	const processIcon = ({ icon = 'IoGlobeOutline', ...engine }) => {
		if (isValidSvg(icon))
			return {
				...engine,
				icon,
			};
		const iconElement = icons[icon] || icons['IoGlobeOutline'];
		return {
			...engine,
			icon: renderToString(iconElement()),
		};
	};

	const processDisplay = ({ name, key, ...item }) => ({
		name,
		key: key.toLowerCase() || name.toLowerCase(),
		display: cx(
			item.mobile === false && 'hidden sm:flex',
			item.desktop === false && 'flex sm:hidden'
		),
		state: item.preload ? LOADING : INIT,
		...item,
	});

	return {
		props: {
			engines: sorted.map(processIcon).map(processDisplay),
			hotkeys,
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

export default function Search({ engines, hotkeys }) {
	const router = useRouter();
	const TabListRef = useRef(null);
	const inputRef = useRef(null);
	const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
	const [tabIndex, setTabIndex] = useState(0);
	const [query, setQuery] = useState('');
	const [tabState, setTabState] = useState(engines.map(({ state }) => state));

	const onSearch = async (value) => {
		const q = value.trim();
		setQuery(q);
		router.push({ pathname: router.pathname, query: { q } }, undefined, {
			shallow: true,
		});
		// window.location.replace(`${window.location.pathname}?q=${q}`);
		if (q.length > 0) {
			inputRef.current.blur();
		}
	};

	const onEngineChange = (index) => {
		setTabIndex(index);
		setTabState((prev) => {
			return {
				...prev,
				[index]: prev[index] === INIT ? LOADING : prev[index],
			};
		});
		setFirstFrameLoaded(true);
	};

	const getNextTabIndex = (currIndex, key) => {
		for (let i = currIndex + 1; i < engines.length + currIndex; i++) {
			const index = i % (engines.length - 1);
			if (engines[index].key[0] === key.toLowerCase()) return index;
		}
		return currIndex;
	};

	const reloadIFrame = (index) => (document.getElementById(`frame-${index}`).src += '');

	useEffect(() => {
		// Get search query from url
		const params = new URLSearchParams(window.location.search);
		const q = params.get('q');
		if (q) setQuery(q);
		if (!q) inputRef.current.focus();
		window.addEventListener('keydown', ({ key }) => {
			if (document.activeElement === inputRef.current || !(key in hotkeys)) return;
			setTabIndex((currIndex) => {
				const nextIndex = getNextTabIndex(currIndex, key);
				if (nextIndex === currIndex) {
					reloadIFrame(nextIndex);
					return currIndex;
				}
				setTabState((prev) => {
					return {
						...prev,
						[nextIndex]: prev[nextIndex] === INIT ? LOADING : prev[nextIndex],
					};
				});
				setFirstFrameLoaded(true);

				return nextIndex;
			});
		});
		return () => {
			window.removeEventListener('keydown', () => {});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pageTitle = query ? query + ' - ' + engines[tabIndex].name : 'Metasearch';

	return (
		<main className='flex flex-col h-screen'>
			<Head>
				<title>{pageTitle}</title>
				<meta property='og:title' content='My page title' key='title' />
			</Head>
			<Tab.Group selectedIndex={tabIndex} onChange={onEngineChange}>
				<header>
					<nav className='input-bar flex shadow-md z-20 dark:border-0 bg-white dark:bg-gray-700'>
						<DebounceInput
							minLength={1}
							inputRef={inputRef}
							debounceTimeout={isMobile ? 2000 : 800}
							value={query}
							onChange={(event) => onSearch(event.target.value)}
							className='w-full h-9 p-2 pl-9 bg-transparent'
							id='search-input'
						/>
						<button
							className='absolute top-0 left-0 h-9 w-9 flex-center'
							onClick={(e) => {
								if (query) reloadIFrame(tabIndex);
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
						className='z-10 flex w-full justify-start bg-white dark:bg-gray-800 drop-shadow-lg max-w-screen overflow-x-scroll scrollbar-hide'
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
						{engines.map(({ icon, color, name, display }, index) => (
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
											if (tabIndex === index && query) reloadIFrame(index);
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
						className={cx('w-full', engines[0].display)}
						key={0}
						static
						style={{
							display: tabIndex === 0 ? 'block' : 'none',
						}}
					>
						{query && (
							<iframe
								{...iFrameProps}
								id='frame-0'
								title={engines[0].name}
								src={processUrl(engines[0].url, query)}
								key={engines[0].name}
								onLoad={() => {
									setFirstFrameLoaded(true);
									setTabState((prev) => ({ ...prev, 0: true }));
								}}
							/>
						)}
					</Tab.Panel>
					{engines.slice(1, engines.length).map(({ preload, name, url, display }, prevIndex) => {
						const index = prevIndex + 1;
						const isSelected = tabIndex === index;
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
