import { VercelRequest, VercelResponse } from '@vercel/node';
import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getHtml } from './_lib/template';

const isDev = !process.env.VERCEL;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        const parsedReq = parseRequest(req);
        const html = getHtml(parsedReq);

        if (isHtmlDebug) {
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(html);
            return;
        }

        const { fileType } = parsedReq;
        const file = await getScreenshot(html);

        res.setHeader('Content-Type', `image/${fileType}`);
        res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=604800, max-age=604800`);
        res.status(200).send(file);
    } catch (e) {
        console.error('Error generating OG image:', e);
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
    }
}
