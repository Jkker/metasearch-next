const fs = require('fs');
// import dbConnect from '../lib/dbConnect';
// import Engine from '../models/Engine';
import { Tab } from '@headlessui/react';
import Icon from '../components/Icon';
import { Fragment, useEffect, useRef } from 'react';
import cx from 'classnames';

export const getServerSideProps = async (ctx) => {
	const engines = await fs.promises.readFile('./data/engine.json', 'utf8');
	return {
		props: {
			engines: JSON.parse(engines),
		},
	};
};

export default function Search({ engines }) {
	const TabListRef = useRef(null);

	const data = engines.map(({ title, ...item }) => ({
		title,
		display: cx(
			item.mobile === false && 'hidden sm:block',
			item.desktop === false && 'flex sm:hidden'
		),
		body: (
			<section>
				<ul className='ml-24 h-full flex flex-col justify-center leading-loose list-disc dark:text-white'>
					<li>{item.url}</li>
				</ul>
			</section>
		),
		...item,
	}));

	return (
		<div className='container '>
			<Tab.Group>
				<Tab.List
					className='flex shadow-md max-w-screen overflow-x-scroll scrollbar-hide'
					ref={TabListRef}
					onWheel={(e) => {
						if (e.deltaY == 0) return;
						TabListRef.current.scrollTo({
							left: TabListRef.current.scrollLeft + e.deltaY,
							behavior: 'smooth',
						});
					}}
				>
					{data.map(({ icon, color, title, body, display, ...item }, index) => (
						<Tab key={index} as={Fragment}>
							{({ selected }) => (
								<button
									className={cx(
										'flex items-center whitespace-nowrap px-2 pt-2 pb-[6px] gap-2 font-medium',
										selected ? 'text-white outline-none' : 'bg-white text-black',
										'transition-all duration-200 ease-in-out',
										'hover:shadow-lg',
										display
									)}
									style={{
										// borderTop: '2px solid #fff',
										borderColor: color,
										borderBottomWidth: '3px',
										// borderRightWidth: '3px',
										backgroundColor: selected ? color : '#fff',
									}}
								>
									<Icon svg={icon} color={selected ? 'white' : color} />
									{title}
								</button>
							)}
						</Tab>
					))}
				</Tab.List>
				<Tab.Panels>
					{data.map(({ icon, title, body, display, ...item }, index) => (
						<Tab.Panel className={cx('max-w-screen overflow-auto h-full', display)} key={index}>
							{body}
						</Tab.Panel>
					))}
				</Tab.Panels>
			</Tab.Group>{' '}
		</div>
	);
}
