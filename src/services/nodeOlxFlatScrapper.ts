/* eslint-disable no-console */
import "../bootstrap.ts";
import puppeteer from "puppeteer";
import mailingService from "./mailingService.ts";
import DatabseService from "./dbService.ts";
import {
  hashObject,
  delay,
  messageFormat,
  dbFilePaths,
  getCurrentTime,
} from "../utils/index.ts";
import { OlxDbEntity, OlxResponseDto } from "../types/index.ts";
import { Scrapper } from "../models/index.ts";
import OLX_FLAT_SCRAPPER_CONFIGURATION from "../config/config.ts";

class NodeOlxFlatScrapper extends Scrapper {
  private _emailTarget = process.env.TARGET_EMAIL || "";
  private _dbSuccess = new DatabseService(dbFilePaths.SENT);
  private _dbFailed = new DatabseService(dbFilePaths.FAILED);

  async _execute() {
    const { url, callbacks } = OLX_FLAT_SCRAPPER_CONFIGURATION;
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const scrapResult = await page.evaluate(() => {
      const elements = document.querySelectorAll("[data-cy=l-card]");

      const offers: OlxResponseDto[] = [];
      elements.forEach((el) => {
        const entity = {
          title: el.querySelector("h6")?.textContent || "-",
          price: el.querySelector("[data-testid=ad-price]")?.textContent || "-",
          locationDate:
            el.querySelector("[data-testid=location-date]")?.textContent || "-",
          url: el.querySelector("a")?.getAttribute("href") || "-",
          featured:
            el.querySelector("[data-testid=adCard-featured]")?.textContent ||
            undefined,
        };
        offers.push(entity);
      });
      return offers;
    });

    await browser.close();

    let transformedResult = scrapResult;
    callbacks.forEach((cb) => {
      transformedResult = cb(transformedResult);
    });

    return transformedResult;
  }

  async prefill() {
    console.log(">> Prefill fn has been executed.");
    const response = await this._execute();
    const currentState = await this._dbSuccess.read();
    const dataToAdd: OlxDbEntity[] = [];
    response.forEach(async (obj) => {
      const objHash = hashObject(obj);
      const alreadyExists = currentState.find(
        (entity) => entity.hash === objHash
      );
      if (!alreadyExists) {
        dataToAdd.push({
          hash: objHash,
          ...obj,
          url: `www.olx.pl${obj.url}`,
          created: new Date().toLocaleString(),
        });
      }
    });
    await this._dbSuccess.batchWrite(dataToAdd);
  }

  async check() {
    console.log(`>> Check fn has been executed. ${getCurrentTime()}`);

    const response = await this._execute();
    const augmentedResponse: OlxDbEntity[] = response.map((obj) => ({
      hash: hashObject(obj),
      ...obj,
      url: `www.olx.pl${obj.url}`,
      created: new Date().toLocaleString(),
    }));

    const state = await this._dbSuccess.read();

    if (state.length === 0) {
      console.log(
        ">> Prefill first! Otherwise lots of email messages will be sent."
      );
      return;
    }

    const addedItems: OlxDbEntity[] = [];
    augmentedResponse.forEach((value) => {
      const existsInDb = state.find((obj) => obj.hash === value.hash);
      if (!existsInDb) {
        addedItems.push(value);
      }
    });

    const success: OlxDbEntity[] = [];
    const failed: OlxDbEntity[] = [];

    const promises = addedItems.map(async (obj) => {
      try {
        await delay(1000);

        await mailingService.sendEmail(
          this._emailTarget,
          "OLX Flat Scrapper",
          messageFormat({
            title: obj.title,
            price: obj.price,
            location: obj.locationDate,
            url: obj.url,
          })
        );
        success.push(obj);
        console.log("Sent: ", obj);
      } catch (e) {
        console.log("Failed: ", obj);
        failed.push(obj);
      }
    });

    await Promise.all(promises);

    await this._dbSuccess.batchWrite(success);
    await this._dbFailed.batchWrite(failed);
  }

  checkInterval(ms: number) {
    this.check();
    setInterval(() => {
      this.check();
    }, ms);
  }
}

export default NodeOlxFlatScrapper;
