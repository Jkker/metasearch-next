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

module.exports = nextConfig
