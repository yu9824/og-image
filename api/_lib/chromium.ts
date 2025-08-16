import { ImageResponse } from '@vercel/og';

export async function getScreenshot(html: string) {
    try {
        console.log('Creating ImageResponse with HTML length:', html.length);
        // @vercel/ogを使用してOG画像を生成
        const response = new ImageResponse(
            html,
            {
                width: 1200,
                height: 630,
                status: 200,
                statusText: 'OK',
            }
        );

        console.log('Converting to array buffer...');
        const arrayBuffer = await response.arrayBuffer();
        console.log('Converting to Buffer...');
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('Error in getScreenshot:', error);
        throw error;
    }
}
