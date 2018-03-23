/* globals window */

const puppeteer = require('puppeteer');
const CRED = require('./cred');
const CONFIG = require('./config');

// console.log(cred, config);
async function run() {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV !== 'dev',
  });
  const page = await browser.newPage();

  await page.goto(`https://accounts.google.com/Login?hl=de&amp;continue=https://scholar.google.de/scholar%3Fscilib%3D${CONFIG.labelId}`);

  // const loginButton = '#gs_hdr_drw_bot > a';
  // await page.evaluate(() => {
  //   const loginContainer = '#gs_hdr_drw';
  //   const loginContainerBot = '#gs_hdr_drw_bot';
  //   const loginButton = '#gs_hdr_drw_bot > a';
  //   const $ = window.$; //otherwise the transpiler will rename it and won't work
  //   $(loginContainerBot).css({
  //     'visibility': 'visible',
  //     'display': 'block'
  //   });
  //   $(loginContainer).css({
  //     'transform': 'none'
  //   });
  // });

  // await page.click(loginButton);

  const userNameSelector = '#identifierId';
  const nextButton = '#identifierNext';
  const passwordSelector = 'input[type="password"]';

  await page.click(userNameSelector);
  await page.keyboard.type(CRED.username);
  await page.click(nextButton);

  await page.addScriptTag({path: require.resolve('jquery')})
  await page.evaluate(() => {
    const $ = window.$;
    $('input[type="password"]').value = 'laksdjf';
  });
  // await page.click(passwordSelector);
  // await page.keyboard.type(CRED.password);
  // await page.click(nextButton);
  

  if (process.env.NODE_ENV !== 'dev') {
    browser.close();
  }
}

run();
