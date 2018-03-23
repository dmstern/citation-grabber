const puppeteer = require('puppeteer');
// const cred = require('./cred');
const config = require('./config');

// console.log(cred, config);
async function run() {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV !== 'dev',
  });
  const page = await browser.newPage();

  await page.goto(`https://scholar.google.de/scholar?scilib=${config.labelId}`);
  const loginButtonSelector = '#gs_hdr_drw_bot > a';
  await page.click(loginButtonSelector);

  if (process.env.NODE_ENV !== 'dev') {
    browser.close();
  }
}

run();
