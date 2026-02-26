import chromium from '@sparticuz/chromium';

const exePath = process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : process.platform === 'linux'
    ? '/usr/bin/google-chrome'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface Options {
    args: string[];
    executablePath: string;
    headless: boolean;
}

export async function getOptions(isDev: boolean): Promise<Options> {
    if (isDev) {
        return {
            args: [],
            executablePath: exePath,
            headless: true,
        };
    }
    return {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
    };
}
