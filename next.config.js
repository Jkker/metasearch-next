/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	async rewrites() {
		return [
			{
				source: '/s/:path*',
				destination: '/:path*',
			},
		];
	},
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(nextConfig);
