import { ImageResponse } from '@vercel/og';
import { FileType } from './types';

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
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
