/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	async rewrites() {
		return [
			{
				source: '/s/:path*',
				destination: '/search/:path*',
			},
		];
	},
};

module.exports = nextConfig
