const puppeteer = require('puppeteer');
const config = {
    headless: false,
    defaultViewport: {
        width: 300,
        height: 600,
        isMobile: true
    }
};

const links = Array(5).fill('https://google.com');

(async () => {
    console.time('puppetPerformance');

    const browser = await puppeteer.launch(config);
    const page = await browser.newPage();

    const test = async (url, index) => {
        await page.goto(url);

        await page.screenshot({
            path: `./imgs/test_${index}.jpg`
        });
    };

    const testFn = async (array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index);
        }
    }
    await testFn(links, test);
    await browser.close();
    console.timeEnd('puppetPerformance');

})();