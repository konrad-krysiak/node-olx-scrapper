/* eslint-disable no-console */
import "../bootstrap.ts";
import Xray from "x-ray";
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
  private _xrayInstance = Xray();

  protected async _execute() {
    const { paginate, pageLimit, callbacks, instance } =
      OLX_FLAT_SCRAPPER_CONFIGURATION.xray;
    return this._xrayInstance(
      instance.source,
      instance.context,
      instance.selector
    )
      .paginate(paginate)
      .limit(pageLimit)
      .then((res) => res as OlxResponseDto[])
      .then((res) => {
        let tmp = res;
        callbacks.forEach((cb) => {
          tmp = cb(tmp);
        });
        return res;
      });
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
          created: new Date().toLocaleString(),
        });
      }
    });
    await this._dbSuccess.batchWrite(dataToAdd);
  }

  async check() {
    console.log(`>> Check fn has been executed. ${getCurrentTime()}`);

    const response = await this._execute();
    const updatedState: OlxDbEntity[] = response.map((obj) => ({
      hash: hashObject(obj),
      ...obj,
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
    updatedState.forEach((value) => {
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
