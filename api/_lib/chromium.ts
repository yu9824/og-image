import puppeteer from 'puppeteer-core';
import type { Page } from 'puppeteer-core';
import { getOptions } from './options';
import { FileType } from './types';

let _page: Page | null = null;

async function getPage(isDev: boolean): Promise<Page> {
    if (_page) {
        return _page;
    }
    const options = await getOptions(isDev);
    const browser = await puppeteer.launch(options);
    _page = await browser.newPage();
    return _page;
}

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
    const page = await getPage(isDev);
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html);
    const file = await page.screenshot({ type });
    return file;
}
