import '../styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta content='width=device-width, initial-scale=1' name='viewport' />
				<link rel="search" type="application/opensearchdescription+xml" href="opensearch.xml" title="Metasearch" />
			</Head>
			<ThemeProvider attribute='class' defaultTheme='system'>
				<Component {...pageProps} />
			</ThemeProvider>
		</>
	);
}

export default MyApp;
