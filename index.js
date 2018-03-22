const puppeteer = require('puppeteer');
const cred = require('./cred');
const config = require('./config');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('https://github.com');
  await page.screenshot({ path: 'screenshots/github.png' });
  
  browser.close();
}

run();
