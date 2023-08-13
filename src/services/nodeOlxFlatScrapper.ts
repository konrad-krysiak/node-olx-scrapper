import Xray from "x-ray";
import hash from "object-hash";
import responseDto from "src/types/responseDto.ts";
import executeOptions from "../types/executeOptions.ts";
import filterFeatured from "../utils/filterFeatured.ts";
import messageFormat from "../utils/messageFormat.ts";
import mailingService from "./mailingService.ts";

class NodeOlxFlatScrapper {
  private _emailTarget = process.env.TARGET_EMAIL || '';
  _state = new Map<string, responseDto>();
  _xrayInstance = Xray();

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

  prefillState() {
    this.execute(
      (res) => {
        console.log("prefill cb executed");
        res.forEach((obj) => this._state.set(hash(obj), obj));
        console.log("Prefill state - ", this._state);
      },
      { pageLimit: 2, filterCb: filterFeatured }
    );
  }

  executeAndCheck() {
    this.execute(
      (res) => {
        console.log("executeAndCheck cb executed");
        const updatedState = new Map(res.map((obj) => [hash(obj), obj]));

        const addedItems: responseDto[] = [];
        updatedState.forEach((value, key) => {
          if (this._state.get(key) === undefined) {
            this._state.set(hash(value), value);
            addedItems.push(value);
          }
        });

        console.log("added items -", addedItems);
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
