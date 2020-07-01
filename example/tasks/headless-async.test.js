const puppeteer = require('puppeteer');
const path = require('path');

const config = {
    defaultViewport: {
        width: 300,
        height: 600,
        isMobile: true
    }
};

const links = Array(3).fill('https://google.com');

const test = async (url, index) => {
    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();

    await page.goto(url);

    await page.screenshot({
        path: path.resolve(`${__dirname}/imgs/test_${index}.jpg`),
    });

    await browser.close();

    if (index + 1 === links.length) console.timeEnd('puppetPerformance');
};

console.time('puppetPerformance');
links.forEach(async (url, index) => await test(url, index));