const {transform} = require('./transform');
const puppeteer = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth')
const {withTimeout} = require('../lib/utils');
const Cache = require('file-system-cache').default;

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const puppeteerPath = process.env.PUPPETEER_CHROMIUM_PATH;

puppeteer.use(stealth());

let fetch = null;
let engine = null;

const timeoutPromise = function(timeout) { 
    timeout = timeout||10000;
    const seconds = timeout/1000;
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Navigation timeout after ${seconds} seconds`)), timeout)
    );
}

async function initializeEngine() {
    if (!engine) {
        if(executablePath) {
            engine = await puppeteer.launch({ 
                executablePath: executablePath,
                headless: true
            });
        } else {
            engine = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: puppeteerPath,
                headless: true
            });
        }
    }
}

async function initializeFetch() {
    if(!fetch) {
        const { default: fetchModule } = await import('node-fetch');
        fetch = fetchModule;
    }
}


async function downloadWithBrowser(url) {
    await initializeEngine();
    try {
        const page = await engine.newPage();
        let response = null;

        page.on('response', (res) => {
            if (res.url() === url) response = res;
        });

        await Promise.race([
            page.goto(url, { waitUntil: 'load' }),
            timeoutPromise(),
        ]);

        if (response && response.status() >= 400) {
            throw new Error(`Browser failed with status code: ${response.status()}`);
        }

        const html = await page.content();
        await page.close();
        return { html, error: null };
    } catch (error) {
        console.error(error);
        return { html: null, error };
    }
}

async function downloadWithFetch(url) {
    await initializeFetch();
    try {

        let response = null;
        async function fetchUrl() { response = await fetch(url); }
        await Promise.race([
            fetchUrl(),
            timeoutPromise(),
        ]);

        if (!response) {
            throw new Error(`Fetch response unuccessful`);
        }

        if (!response.ok) {
            throw new Error(`Fetch failed with status code: ${response.status}`);
        }
        const html = await response.text();
        return { html, error: null };
    } catch (error) {
        console.log(error)
        return { html: null, error };
    }
}

async function downloadFirstNonNull(url) {
    const withNullFilter = async (method) => {
        const result = await method(url);
        if (result && result.html) return result; // Return only non-null results
        return null; // Ensure nulls propagate correctly
    };

    const nonNullResult = await Promise.race([
        withNullFilter(downloadWithBrowser),
        withNullFilter(downloadWithFetch),
    ]);

    return nonNullResult || { html: null, error: 'Both methods returned null or failed' };
}

class Browser {

    constructor() {
        this.name = 'Browser';
        this.cache = Cache({
            basePath: "./urls",
            ns: this.name,
            hash: 'sha256',
            debug: false,
            autoInvalidate: false,
            enableMonitoring: false
        });
    }

    download = async function(url) {

        const self = this;
        let cached = await self.cache.get(url);
        if (!cached) {        
            console.log('Downloading',url);
            const [browserResult, fetchResult] = await Promise.allSettled([
                downloadWithBrowser(url),
                downloadWithFetch(url)
            ]);
            const browserSuccess = browserResult.status === 'fulfilled' && browserResult.value.html;
            const fetchSuccess = fetchResult.status === 'fulfilled' && fetchResult.value.html;
            if (browserSuccess) {
                cached = browserResult;
                await self.cache.set(url,browserResult);
            } else if (fetchSuccess) {
                cached = fetchResult;
                await self.cache.set(url,fetchResult);
            }
        }
        const { error, data } = transform(url, cached.value.html);
        return error ? null : data;        
    };

    all = async function (urls, timeout) {
        const self = this;
        timeout = timeout || 5000;
        const promises = urls.map((url) =>
            withTimeout(url, self.download(url), timeout)
        );
        const results = await Promise.all(promises);
        return results;
    };
}

module.exports = Browser;
