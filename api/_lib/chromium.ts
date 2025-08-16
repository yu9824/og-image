import puppeteer, { Browser, Page } from 'puppeteer-core';
import { getOptions } from './options';
import { FileType } from './types';

let _page: Page | null;
let _browser: Browser | null;

async function getPage(isDev: boolean) {
    if (_page) {
        return _page;
    }
    const options = await getOptions(isDev);
    _browser = await puppeteer.launch(options);
    _page = await _browser.newPage();
    return _page;
}

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
    const page = await getPage(isDev);
    await page.setViewport({ width: 1200, height: 630 });
    await page.setContent(html);
    const file = await page.screenshot({ type });
    return file;
}

// クリーンアップ関数を追加
export async function cleanup() {
    if (_page) {
        await _page.close();
        _page = null;
    }
    if (_browser) {
        await _browser.close();
        _browser = null;
    }
}
