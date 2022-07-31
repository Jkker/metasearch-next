import { Tab } from '@headlessui/react';
import cx from 'clsx';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { isMobile } from 'react-device-detect';
import { FiExternalLink, FiSearch } from 'react-icons/fi';
import { HiExternalLink } from 'react-icons/hi';
import { TiDelete } from 'react-icons/ti';
import { Fade, Icon, Menu, TabButton, ThemeSwitch } from '../components';
import dbConnect from '../lib/dbConnect';
import Engine from '../models/Engine';
import { lightness } from '../utils';

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

	const sorted = JSON.parse(JSON.stringify(engines))
		.filter((e) => !e.disabled)
		.sort((a, b) => {
			if (a.weight < b.weight) return 1;
			if (a.weight > b.weight) return -1;
			return a.name < b.name ? -1 : 1;
		});
	const hotkeys = sorted.reduce((acc, engine, index) => {
		const key = engine.key[0].toLowerCase();
		acc[key] = acc[key] ? [...acc[key], index] : [index];
		return acc;
	}, {});

	const computeLightness = ({ color, ...engine }) => ({
		...engine,
		lightness: lightness(color),
		color,
	});

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
		state: INIT,
		...item,
		preload: false,
	});

	return {
		props: {
			engines: sorted.map(computeLightness).map(processIcon).map(processDisplay),
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
	className: 'bg-transparent',
};

export default function Search({ engines, hotkeys: tabHotkeys }) {
	const router = useRouter();
	const TabListRef = useRef(null);
	const inputRef = useRef(null);
	const [tabIndex, setTabIndex] = useState(0);
	const [query, setQuery] = useState('');
	const [tabState, setTabState] = useState(engines.map(({ state }) => state));
	const firstFrameLoaded = tabState[0] === READY;
	const setFirstFrameLoaded = (args) => undefined;

	const currentEngine = engines[tabIndex];

	const onSearch = async (value) => {
		const q = value.trim();
		setQuery(q);
		router.push({ pathname: router.pathname, query: { q } }, undefined, {
			shallow: true,
		});
		if (q.length > 0) inputRef.current.blur();
	};

	const onEngineChange = (index) => {
		setTabIndex(index);
		setTabState((prev) => ({
			...prev,
			[index]: prev[index] === INIT ? (engines[index].embeddable ? LOADING : READY) : prev[index],
		}));
		setFirstFrameLoaded(true);
	};

	const getNextTabIndex = (currIndex, key) => {
		for (let i = currIndex + 1; i < engines.length + currIndex; i++) {
			const index = i % engines.length;
			if (engines[index].key[0] === key.toLowerCase()) return index;
		}
		return currIndex;
	};

	const goToPreviousTab = () =>
		setTabIndex((prev) => (prev - 1 < 0 ? engines.length - 1 : prev - 1));
	const goToNextTab = () => setTabIndex((prev) => (prev + 1 >= engines.length ? 0 : prev + 1));

	const reloadPanel = (index) => {
		if (engines[index].embeddable) document.getElementById(`frame-${index}`).src += '';
	};
	const processUrl = (url) => url.replace(/%s/g, encodeURIComponent(query));
	const openLink = (link) => window?.open(link, '_blank', 'noopener', 'noreferrer');

	useEffect(() => {
		// Get search query from url
		const params = new URLSearchParams(window.location.search);
		const q = params.get('q');
		if (q) setQuery(q);
		else inputRef.current.focus();

		// Register keyboard shortcuts
		const listener = (e) => {
			const key = e.key;
			const { altKey, ctrlKey, metaKey, shiftKey } = e;

			const inputFocused = document.activeElement === inputRef.current;

			if (key === 'Enter' && !inputFocused) {
				if (altKey || ctrlKey || metaKey || shiftKey)
					setTabIndex((currIndex) => {
						const url = document.getElementById(`frame-${currIndex}`)?.getAttribute('data-src');
						openLink(url);
						return currIndex;
					});
				else if (tabState[tabIndex] === READY) reloadPanel(tabIndex);
				return;
			}
			if (inputFocused) {
				if (['Escape'].includes(key)) {
					inputRef.current.blur();
					TabListRef.current.focus();
				}
				return;
			} else {
				switch (key) {
					case '/':
					case '\\':
						e.preventDefault();
						inputRef.current.focus();
						return;
					case 'ArrowUp':
					case 'ArrowLeft':
						e.preventDefault();
						goToPreviousTab();
						return;
					case 'ArrowRight':
					case 'ArrowDown':
						e.preventDefault();
						goToNextTab();
						return;
					case 'Tab':
						if (shiftKey && !ctrlKey) {
							e.preventDefault();
							goToPreviousTab();
						} else if (!ctrlKey) {
							goToNextTab();
						}
						return;
				}

				if (key in tabHotkeys) {
					setTabIndex((currIndex) => {
						const nextIndex = getNextTabIndex(currIndex, key);

						if (nextIndex === currIndex) {
							reloadPanel(nextIndex);
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
				}
			}
		};
		if (!isMobile) {
			window.addEventListener('keydown', listener);
			return () => {
				window.removeEventListener('keydown', listener);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pageTitle = query ? query + ' - ' + currentEngine.name : 'Metasearch';

	return (
		<main className='flex flex-col h-screen'>
			<Head>
				<title>{pageTitle}</title>
				<meta property='og:title' content='My page title' key='title' />
			</Head>
			<Tab.Group selectedIndex={tabIndex} onChange={onEngineChange} manual>
				<header>
					<nav className='input-bar flex shadow-md z-20 dark:border-0 bg-white dark:bg-gray-700'>
						<DebounceInput
							minLength={1}
							inputRef={inputRef}
							debounceTimeout={isMobile ? 10000 : 800}
							value={query}
							onChange={(event) => onSearch(event.target.value)}
							className='w-full h-9 p-2 pl-9 bg-transparent'
							id='search-input'
						/>
						<button
							className='absolute top-0 left-0 h-9 w-9 flex-center'
							onClick={(e) => {
								if (query) reloadPanel(tabIndex);
							}}
							title='Search'
						>
							<FiSearch />
						</button>
						<Fade show={query.length > 0}>
							<button
								className='absolute top-0 right-9 h-9 w-9 flex-center opacity-40'
								onClick={() => onSearch('')}
								title='Clear search'
							>
								<TiDelete />
							</button>
						</Fade>

						<Menu>
							<a
								className='whitespace-nowrap flex items-center justify-between w-full px-2 py-1 transition-all duration-200 ease-in-out gap-2.5'
								href={processUrl(currentEngine.url)}
								target='_blank'
								rel='noopener noreferrer'
							>
								New tab
								<HiExternalLink />
							</a>
							{isMobile && currentEngine.url_scheme && (
								<a
									className='whitespace-nowrap flex items-center justify-between w-full px-2 py-1 transition-all duration-200 ease-in-out gap-2.5'
									href={processUrl(currentEngine.url_scheme)}
									// target='_blank'
									rel='noopener noreferrer'
								>
									Open App
									<Icon color={currentEngine.color}>{currentEngine.icon}</Icon>
								</a>
							)}
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
						{engines.map(({ url, lightness, ...props }, index) => (
							<Tab key={index} as={Fragment}>
								{({ selected }) => (
									<TabButton
										{...props}
										lightness={lightness}
										selected={selected}
										loading={tabState[index] === LOADING && query}
										onDoubleClick={() => {
											openLink(processUrl(url));
										}}
										onClick={() => {
											// Reload the page if the user clicks the same engine twice
											if (tabIndex === index && query) reloadPanel(index);
										}}
									/>
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
								src={processUrl(engines[0].url)}
								key={engines[0].name}
								onLoad={() => {
									setFirstFrameLoaded(true);
									setTabState((prev) => ({ ...prev, 0: READY }));
								}}
							/>
						)}
					</Tab.Panel>
					{engines
						.slice(1, engines.length)
						.map(
							({ preload, name, url, display, embeddable, url_scheme, color, icon }, prevIndex) => {
								const index = prevIndex + 1;
								const isSelected = tabIndex === index;
								const src = processUrl(url);
								return (
									<Tab.Panel
										className={cx('w-full', display)}
										key={index}
										style={{
											display: isSelected ? 'block' : 'none',
										}}
										static
									>
										{query &&
											(embeddable ? (
												firstFrameLoaded &&
												(isSelected || preload) && (
													<iframe
														{...iFrameProps}
														id={`frame-${index}`}
														title={name}
														key={name}
														loading={preload ? 'eager' : 'lazy'}
														src={src}
														data-src={src}
														onLoad={() => {
															setTabState((prev) => ({ ...prev, [index]: READY }));
														}}
													/>
												)
											) : (
												<div
													className='max-w-[240px] m-auto flex-center gap-4 h-full flex-col pb-[72px]'
													id={`frame-${index}`}
													data-src={src}
												>
													{isMobile && (
														<a
															href={processUrl(url_scheme)}
															className={cx(
																'w-full box-border flex-center gap-2 whitespace-nowrap px-6 py-2.5 rounded uppercase',
																'transition-all duration-200 ease-in-out',
																'text-white dark:text-gray-50',
																'hover:brightness-95',
																'dark:hover:brightness-125',
																'active:brightness-90 dark:active:brightness-125'
															)}
															style={{
																backgroundColor: color,
															}}
														>
															Open in App
															<Icon color={'#fff'}>{icon}</Icon>
														</a>
													)}
													<a
														href={src}
														className={cx(
															'w-full box-border flex-center gap-2 whitespace-nowrap px-6 py-2.5 rounded uppercase',
															'transition-all duration-200 ease-in-out',
															isMobile
																? 'text-gray-800 dark:text-gray-50'
																: 'text-white dark:text-gray-50',
															'hover:brightness-95',
															'dark:hover:brightness-125',
															'active:brightness-90 dark:active:brightness-125',
															'border dark:border-gray-500'
														)}
														target='_blank'
														rel='noopener noreferrer'
														style={
															isMobile
																? {}
																: {
																		backgroundColor: color,
																  }
														}
													>
														Open New tab
														<HiExternalLink />
													</a>
													<a
														href={src}
														className={cx(
															'w-full box-border flex-center gap-2 whitespace-nowrap px-6 py-2.5 rounded uppercase',
															'transition-all duration-200 ease-in-out',
															'text-gray-800 dark:text-gray-50',
															'hover:brightness-95',
															'dark:hover:brightness-125',
															'active:brightness-90 dark:active:brightness-125',
															'border dark:border-gray-500'
														)}
														rel='noopener noreferrer'
													>
														Open Here
													</a>
												</div>
											))}
									</Tab.Panel>
								);
							}
						)}
				</Tab.Panels>
			</Tab.Group>
		</main>
	);
}
