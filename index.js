const puppeteer = require("puppeteer");
const CRED = require("./cred");
const CONFIG = require("./config");
const fs = require("fs");
const path = require("path");

const googleLoginPageUrl = "https://accounts.google.com/Login?hl=de&amp";
const googleScholarUrl = "https://scholar.google.de/scholar?scilib=";

const OPTIONS = {
  labelId: 1,
  fileName: "citations.bib",
  outPath: "."
};

Object.assign(OPTIONS, CONFIG);

const log = {
  info(message) {
    process.stdout.write(`${message}.\n`);
  },

  error(message, error = "") {
    process.stderr.write(`${message}. \n ${error}\n`);
  }
};

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  try {
    log.info("Logging in to Google..");
    await page.goto(googleLoginPageUrl);

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
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 3000 });
  } catch (error) {
    log.error("Login failed.", error);
    throw error;
  }
}

async function grabCitations(page) {
  try {
    log.info("Navigating to Google Scholar...");
    await page.goto(`${googleScholarUrl}${OPTIONS.labelId}`);

    const selectAllCitations = "#gs_res_ab_xall";
    const exportCitations = "#gs_res_ab_exp-b";
    const bibTex = "#gs_res_ab_exp-d a:nth-child(1)";
    page.setViewport({ width: 1280, height: 768 });
    await page.click(selectAllCitations);
    await page.click(exportCitations);
    await page.click(bibTex);
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 5000 });
  } catch (error) {
    log.error("Failed to grab citations.", error);
    throw error;
  }
}

async function downloadCitations(page) {
  try {
    log.info("Downloading citations...");

    // get citations from dom:
    const contentSelector = await page.$("pre");
    const content = await page.evaluate(
      element => element.innerHTML,
      contentSelector
    );

    // download citations:
    fs.writeFile(
      path.join(OPTIONS.outPath, OPTIONS.fileName),
      content,
      error => {
        if (error) {
          log.error("An error occured while writing the file.", error);
          throw error;
        }

        log.info("The file has been saved. Happy writing!");
      }
    );
  } catch (error) {
    log.error("Failed to download citations.", error);
    throw error;
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false // process.env.NODE_ENV !== "dev" // TODO: login fails if chrome runs headless. see https://github.com/dmstern/citation-grabber/issues/1
  });
  const page = await browser.newPage();

  try {
    await login(page);
    await grabCitations(page);
    await downloadCitations(page);
  } catch (error) {
    log.error(
      "Something went wrong! \n Please read README.md or file an issue at https://github.com/dmstern/citation-grabber/issues."
    );
  } finally {
    if (process.env.NODE_ENV !== "dev") {
      browser.close();
    }
  }
}

run();
