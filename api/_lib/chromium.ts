import { ImageResponse } from '@vercel/og';

export async function getScreenshot(html: string) {
    // @vercel/ogを使用してOG画像を生成
    const response = new ImageResponse(
        {
            html: html,
            width: 1200,
            height: 630,
        }
    );

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
