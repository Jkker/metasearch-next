import '../styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta content='width=device-width, initial-scale=1' name='viewport' />
			</Head>
			<ThemeProvider attribute='class'>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	);
}

export default MyApp;
