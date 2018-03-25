const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let config = null;
const googleLoginPageUrl = "https://accounts.google.com/Login?hl=de&amp";
const googleScholarUrl = "https://scholar.google.de/scholar?scilib=";

const log = {
  info(message) {
    process.stdout.write(`${message}.\n`);
  },

  error(message, error = "") {
    process.stderr.write(`${message}. \n ${error}\n`);
  }
};

let screenshotCounter = 0;
const logDir = "./log";
async function debugScreenshot(page) {
  if (!getConfig().debugMode) {
    return;
  }
  fs.exists(logDir, exists => {
    if (!exists) {
      fs.mkdir(logDir);
    }
  });
  await page.screenshot({
    path: `${logDir}/screenshot-${screenshotCounter++}.png`,
    type: "png"
  });
}

function getConfig() {
  if (!config) {
    config = {
      labelId: 1,
      fileName: "citations.bib",
      outPath: "."
    };

    try {
      const userConfig = require("./config");
      Object.assign(config, userConfig);
    } catch (error) {
      log.error(
        "Seems like there is no config file. Please create a config.js file as documented in README.md.",
        error
      );
    }
  }
  return config;
}

const selectors = {
  email: "#Email",
  next: "#next",
  password: "#Passwd",
  passwordNext: "#signIn",
  selectAllCitations: "#gs_res_ab_xall",
  exportCitations: "#gs_res_ab_exp-b",
  bibTex: "#gs_res_ab_exp-d a:nth-child(1)"
};

const graphicalModeSelectors = {
  email: "#identifierId",
  next: "#identifierNext",
  password: '#password input[type="password"]',
  passwordNext: "#passwordNext"
};

if (process.env.NODE_ENV === "dev") {
  Object.assign(selectors, graphicalModeSelectors);
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  try {
    log.info("Logging in to Google..");
    await page.goto(googleLoginPageUrl);

    await page.waitForSelector(selectors.email, { visible: true });
    await debugScreenshot(page);

    await page.click(selectors.email);
    await page.keyboard.type(getConfig().credentials.username);
    await debugScreenshot(page);
    await page.click(selectors.next);

    await timeout(8000);

    await debugScreenshot(page);
    await page.click(selectors.password);
    await page.keyboard.type(getConfig().credentials.password);
    await debugScreenshot(page);
    await page.click(selectors.passwordNext);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await debugScreenshot(page);
  } catch (error) {
    log.error("Login failed.", error);
    throw error;
  }
}

async function grabCitations(page) {
  try {
    log.info("Navigating to Google Scholar...");
    await page.goto(`${googleScholarUrl}${getConfig().labelId}`);
    await debugScreenshot(page);
    page.setViewport({ width: 1280, height: 768 });
    await page.waitForSelector("#gs_res_ab_xall", { visible: true });
    await debugScreenshot(page);

    log.info("Getting citations...");
    await page.click(selectors.selectAllCitations);
    await debugScreenshot(page);
    await page.click(selectors.exportCitations);
    await debugScreenshot(page);
    await page.click(selectors.bibTex);
    await debugScreenshot(page);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await debugScreenshot(page);
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
      path.join(getConfig().outPath, getConfig().fileName),
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
    headless: process.env.NODE_ENV !== "dev"
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
