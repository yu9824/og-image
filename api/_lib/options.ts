import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const exePath = process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Options {
    args: string[];
    executablePath: string;
    headless: 'shell';
}

export async function getOptions(isDev: boolean): Promise<Options> {
    if (isDev) {
        return {
            args: puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
            executablePath: exePath,
            headless: 'shell',
        };
    }
    return {
        args: puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' }),
        executablePath: await chromium.executablePath(),
        headless: 'shell',
    };
}
