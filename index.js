/* globals window */

const puppeteer = require("puppeteer");
const CRED = require("./cred");
const CONFIG = require("./config");

async function login() {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV !== "dev"
    });
    const page = await browser.newPage();

    await page.goto(`https://accounts.google.com/Login?hl=de&amp`);

    const userNameSelector = "#identifierId";
    const nextButton = "#identifierNext";

    await page.click(userNameSelector);
    await page.keyboard.type(CRED.username);
    await page.click(nextButton);

    const passwordSelector = '#password input[type="password"]';
    const passwordNextButton = '#passwordNext';
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

login();
