import { DebounceInput } from 'react-debounce-input';

export default function Input({
  value,
  onChange,
}) {
	return (
		<DebounceInput
			minLength={2}
			debounceTimeout={300}
			onChange={(event) => this.setState({ value: event.target.value })}
		/>
	);
}
