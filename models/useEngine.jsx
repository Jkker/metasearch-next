import { useContext, createContext, useState, useEffect } from 'react';

const EngineContext = createContext();

const EngineProvider = ({ children }) => {
	const [engine, setEngine] = useState(null);

	useEffect(() => {
		const engine = new Engine();
		setEngine(engine);
	}, []);

	return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
};

const useEngine = () => {
	const engine = useContext(EngineContext);
	if (!engine) {
		throw new Error('useEngine must be used within EngineProvider');
	}
	return engine;
};

export { EngineProvider, useEngine };
