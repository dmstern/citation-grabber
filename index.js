/* globals window */

const puppeteer = require("puppeteer");
const CRED = require("./cred");
const CONFIG = require("./config");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  await page.goto(`https://accounts.google.com/Login?hl=de&amp`);

  const userNameSelector = "#identifierId";
  const nextButton = "#identifierNext";

  await page.click(userNameSelector);
  await page.keyboard.type(CRED.username);
  await page.click(nextButton);

  const passwordSelector = '#password input[type="password"]';
  const passwordNextButton = "#passwordNext";
  await timeout(2000);
  await page.click(passwordSelector);
  await page.keyboard.type(CRED.password);
  await page.click(passwordNextButton);
  await page.waitForNavigation({waitUntil: 'networkidle2'});
}

async function grabCitations(page) {
  await page.goto(`https://scholar.google.de/scholar?scilib=${CONFIG.labelId}`);

  const selectAllCitations = '#gs_res_ab_xall';
  const exportCitations = '#gs_res_ab_exp-b';
  const bibTex = '#gs_res_ab_exp-d a:nth-child(1)';
  page.setViewport({width: 1280, height: 768});
  await page.click(selectAllCitations);
  await page.click(exportCitations);
  await page.click(bibTex);
  await page.waitForNavigation({waitUntil: 'networkidle2'});
}

async function run() {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV !== "dev"
    });
    const page = await browser.newPage();

    await login(page);
    await grabCitations(page);

    if (process.env.NODE_ENV !== "dev") {
      browser.close();
    }
  } catch (err) {
    console.error("Something went wrong!", err);
  }
}

run();
