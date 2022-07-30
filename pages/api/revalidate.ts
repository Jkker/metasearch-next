import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// Check for secret to confirm this is a valid request
	if (req.query.secret !== process.env.REVALIDATE_KEY) {
		return res.status(401).json({ revalidated: false, message: 'Invalid token' });
	}

	try {
		await res.revalidate('/');
		return res.json({ revalidated: true, message: 'Revalidation successful' });
	} catch (err) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		return res.status(500).send({ revalidated: false, message: 'Error revalidating' });
	}
}
