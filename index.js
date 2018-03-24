/* globals window */

const puppeteer = require("puppeteer");
const CRED = require("./cred");
const CONFIG = require("./config");

// console.log(cred, config);
async function run() {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV !== "dev"
    });
    const page = await browser.newPage();

    await page.goto(
      `https://accounts.google.com/Login?hl=de&amp;continue=https://scholar.google.de/scholar%3Fscilib%3D${
        CONFIG.labelId
      }`
    ); // https://scholar.google.de/scholar?scilib=${CONFIG.labelId}

    //// trying to access login from non logged in scholar page:
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

    // direct login:
    const userNameSelector = "#identifierId";
    const nextButton = "#identifierNext";

    await page.click(userNameSelector);
    await page.keyboard.type(CRED.username);
    await page.click(nextButton);

    const passwordSelector = '#password input[type="password"]';
    const passwordNextButton = '#passwordNext';
    // page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    // page.waitForSelector(passwordSelector);
    // const pw = await page.$(passwordSelector);
    // console.log("passwortSelector:___", pw);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click(passwordSelector);
    await page.keyboard.type(CRED.password);
    await page.click(passwordNextButton);

    if (process.env.NODE_ENV !== "dev") {
      browser.close();
    }
  } catch (err) {
    console.error('Something went wrong!', err);
  }
}

run();
