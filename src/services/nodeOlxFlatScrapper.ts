import '../bootstrap.ts';
import Xray from "x-ray";
import responseDto from "src/types/responseDto.ts";
import executeOptions from "../types/executeOptions.ts";
import filterFeatured from "../utils/filterFeatured.ts";
import messageFormat from "../utils/messageFormat.ts";
import mailingService from "./mailingService.ts";
import DatabseService, { dbEntity } from './dbService.ts';
import hashObject from '../utils/hashObject.ts';
class NodeOlxFlatScrapper {
  private _emailTarget = process.env.TARGET_EMAIL || '';
  private _xrayInstance = Xray();
  private _db = new DatabseService();

  execute(cb: (res: responseDto[]) => void, options?: executeOptions) {
    this._xrayInstance(
      "https://www.olx.pl/nieruchomosci/stancje-pokoje/krakow/?search%5Border%5D=created_at:desc",
      "[data-cy=l-card]",
      [
        {
          title: "h6",
          price: "[data-testid=ad-price]",
          locationDate: "[data-testid=location-date]",
          url: "a@href",
          featured: "[data-testid=adCard-featured]",
        },
      ]
    )
      .paginate("[data-testid=pagination-forward]@href")
      .limit(options?.pageLimit || 1)
      .then((res: responseDto[]) => {
        // #1 - Execute filter
        const filtered = options?.filterCb ? options.filterCb(res) : res;
        // #2 - Execute main callback
        cb(filtered);
      })
      .catch((err) => {
        console.log("Error has occurred.");
        console.log(err);
      });
  }

  prefillState(pageLimit: number) {
    this.execute(
      async (res) => {
        console.log("Prefill callback has been executed.");
        const currentState = await this._db.read();
        const dataToAdd: dbEntity[] = [];
        res.forEach(async (obj) => {
          const objHash = hashObject(obj);
          const alreadyExists = currentState.find(entity => entity.hash === objHash);
          if(!alreadyExists) {
            dataToAdd.push({ hash: objHash, ...obj, created: new Date().toLocaleString() });
          }
        })
        await this._db.batchWrite(dataToAdd);
      },
      { pageLimit, filterCb: filterFeatured }
    );
  }

  executeAndCheck() {
    this.execute(
      async (res) => {
        console.log("Execute and check callback has been executed.");
        const updatedState: dbEntity[] = res.map(obj => {
          return {
            hash: hashObject(obj),
            ...obj,
            created: new Date().toLocaleString()
          }
        })

        const state = await this._db.read();
        if(state.length === 0) {
          console.log('Prefill first! Otherwise lots of email messages will be sent.');
          return;
        }
        const addedItems: dbEntity[] = [];
        updatedState.forEach((value) => {
          const existsInDb = state.find(obj => obj.hash === value.hash);
          if(!existsInDb) {
            addedItems.push(value);
          }
        });

        await this._db.batchWrite(addedItems);

        console.log("Following items has been added -", addedItems);
        addedItems.forEach((obj) => {
          mailingService
            .sendEmail(
              this._emailTarget,
              "OLX Flat Scrapper",
              messageFormat({
                title: obj.title,
                price: obj.price,
                location: obj.locationDate,
                url: obj.url,
              })
            )
            .then((res) => {
              console.log(res);
              console.log("Offer has been sent - ", obj);
            })
            .catch((err) => {
              console.log("Error when sending email - ", err);
            });
        });
      },
      { pageLimit: 1, filterCb: filterFeatured }
    );
  }
}

export default NodeOlxFlatScrapper;
