import '../bootstrap.ts';
import Xray from "x-ray";
import olxResponseDto from "../types/olxResponseDto.ts";
import executeOptions from "../types/executeOptions.ts";
import filterFeatured from "../utils/filterFeatured.ts";
import messageFormat from "../utils/messageFormat.ts";
import mailingService from "../services/mailingService.ts";
import DatabseService from '../services/dbService.ts';
import hashObject from '../utils/hashObject.ts';
import { olxDbEntity } from '../types/olxDbEntity.ts';
import Scrapper from '../models/Scrapper.ts';

class NodeOlxFlatScrapper extends Scrapper<olxResponseDto> {
  private _emailTarget = process.env.TARGET_EMAIL || '';
  private _db = new DatabseService();
  private _xrayInstance = Xray();

  constructor() {
    super();
  }

  protected _execute(cb: (res: olxResponseDto[]) => void, options?: executeOptions<olxResponseDto>) {
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
      .then((res: olxResponseDto[]) => {
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

  executeToPrefill(pageLimit: number) {
    this._execute(
      async (res) => {
        console.log("Prefill callback has been executed.");
        const currentState = await this._db.read();
        const dataToAdd: olxDbEntity[] = [];
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
    this._execute(
      async (res) => {
        console.log("Execute and check callback has been executed.");
        const updatedState: olxDbEntity[] = res.map(obj => {
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
        const addedItems: olxDbEntity[] = [];
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

  executeAndCheckInterval(ms: number) {
      setInterval(() => {
        this.executeAndCheck();
      }, ms)
  }
}

export default NodeOlxFlatScrapper;
