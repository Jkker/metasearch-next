import { Menu, Transition } from '@headlessui/react';
import cx from 'classnames';
import { cloneElement, Fragment } from 'react';
import { RiCloseLine, RiMenuLine } from 'react-icons/ri';

export default function CustomMenu({ children = [], ...props }) {
	return (
		<div className='flex text-right z-10 '>
			<Menu as='div' className='relative text-left'>
				{({ open }) => (
					<>
						<Menu.Button
							className={cx(
								'whitespace-nowrap flex-center h-9 w-9 relative',
								'bg-white dark:bg-gray-700',
								'transition-all duration-200 ease-in-out',
								'hover:brightness-95 dark:hover:brightness-125',
								// 'focus:outline-none focus-visible:brightness-90 dark:focus-visible:brightness-110',
								'active:brightness-90 dark:active:brightness-125'
							)}
						>
							{open ? <RiCloseLine /> : <RiMenuLine />}
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
							<Menu.Items className='absolute right-0 mt-1 mr-1 origin-top-right divide-y divide-gray-100 rounded-md drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-white dark:bg-gray-700'>
								<div className='p-2'>
									{children &&
										(Array.isArray(children) ? (
											children.map((child, index) => (
												<Menu.Item key={index}>
													{({ active }) => cloneElement(child, { active })}
												</Menu.Item>
											))
										) : (
											<Menu.Item>{({ active }) => cloneElement(children, { active })}</Menu.Item>
										))}
								</div>
							</Menu.Items>
						</Transition>
					</>
				)}
			</Menu>
		</div>
	);
}
