/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	async rewrites() {
		return [
			{
				source: '/s*',
				destination: '/search*',
			},
		];
	},
};

module.exports = nextConfig
