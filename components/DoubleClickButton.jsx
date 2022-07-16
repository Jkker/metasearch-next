import { useRef, forwardRef } from 'react';

const DoubleClickButton = forwardRef(
	({ onClick = () => {}, onDoubleClick = () => {}, children, ...props }, ref) => {
		const timer = useRef();

		const onClickHandler = (event) => {
			clearTimeout(timer.current);

			if (event.detail === 1) {
				timer.current = setTimeout(onClick, 200);
			} else if (event.detail === 2) {
				onDoubleClick();
			}
		};

		return (
			<button onClick={onClickHandler} {...props} ref={ref}>
				{children}
			</button>
		);
	}
);

DoubleClickButton.displayName = 'DoubleClickButton';

export default DoubleClickButton;
