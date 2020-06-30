const puppeteer = require('puppeteer');
const config = {
    headless: false,
    defaultViewport: {
        width: 300,
        height: 600,
        isMobile: true
    }
};

const links = Array(5).fill('https://gazeta.pl');

const test = async (url, index) => {
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();

    await page.goto(url);

    await page.screenshot({
        path: `./imgs/test_${index}.jpg`
    });

    await browser.close();

    if (index + 1 === links.length) console.timeEnd('puppetPerformance');
};

console.time('puppetPerformance');
links.forEach((url, index) => test(url, index));