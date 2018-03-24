const puppeteer = require("puppeteer");
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

const selectors = {
  email: "#Email",
  next: "#next",
  password: "#Passwd",
  passwordNext: "#signIn",
  selectAllCitations: "#gs_res_ab_xall",
  exportCitations: "#gs_res_ab_exp-b",
  bibTex: "#gs_res_ab_exp-d a:nth-child(1)"
};

const devSelectors = {
  email: "#identifierId",
  next: "#identifierNext",
  password: '#password input[type="password"]',
  passwordNext: "#passwordNext"
};

if (process.env.NODE_ENV === "dev") {
  Object.assign(selectors, devSelectors);
}

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

    await page.waitForSelector(selectors.email, { visible: true });

    await page.click(selectors.email);
    await page.keyboard.type(OPTIONS.credentials.username);
    await page.click(selectors.next);

    await timeout(8000);

    await page.click(selectors.password);
    await page.keyboard.type(OPTIONS.credentials.password);
    await page.click(selectors.passwordNext);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
  } catch (error) {
    log.error("Login failed.", error);
    throw error;
  }
}

async function grabCitations(page) {
  try {
    log.info("Navigating to Google Scholar...");
    await page.goto(`${googleScholarUrl}${OPTIONS.labelId}`);
    page.setViewport({ width: 1280, height: 768 });
    await page.waitForSelector("#gs_res_ab_xall", { visible: true });

    log.info("Getting citations...");
    await page.click(selectors.selectAllCitations);
    await page.click(selectors.exportCitations);
    await page.click(selectors.bibTex);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
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
    headless: process.env.NODE_ENV !== "dev" // TODO: login fails if chrome runs headless. see https://github.com/dmstern/citation-grabber/issues/1
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
