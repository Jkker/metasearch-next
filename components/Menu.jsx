import { Menu, Transition } from '@headlessui/react';
import cx from 'clsx';
import { Fragment } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import Rotate from '../components/Rotate';

export default function CustomMenu({ children = [], ...props }) {
	return (
		<Menu as='div' className='flex z-40 relative' {...props}>
			{({ open }) => (
				<>
					<Menu.Button
						className={cx(
							'flex-center h-9 w-9 ',
							'bg-white dark:bg-gray-700',
							'transition-all duration-200 ease-in-out',
							'hover:brightness-95 dark:hover:brightness-125',
							'active:brightness-90 dark:active:brightness-125'
						)}
					>
						<Rotate show={open}>
							<FiX />
							<FiMenu />
						</Rotate>
					</Menu.Button>
					<Transition
						as={Fragment}
						enter='transition ease-out duration-100'
						enterFrom='transform opacity-0 scale-95'
						enterTo='transform opacity-100 scale-100'
						leave='transition ease-in duration-75'
						leaveFrom='transform opacity-100 scale-100'
						leaveTo='transform opacity-0 scale-95'
					>
						<Menu.Items className='absolute right-0 mt-10 mr-1 origin-top-right  divide-gray-100 rounded-md drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-white dark:bg-gray-700 p-2 space-y-2'>
							{children}
						</Menu.Items>
					</Transition>
				</>
			)}
		</Menu>
	);
}
