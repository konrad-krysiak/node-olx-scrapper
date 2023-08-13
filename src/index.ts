import dotenv from "dotenv";
import NodeOlxFlatScrapper from "./services/nodeOlxFlatScrapper.ts";

dotenv.config();

const scrapper = new NodeOlxFlatScrapper();
scrapper.prefillState();

setInterval(() => {
  scrapper.executeAndCheck();
}, parseInt(process.env.INTERVAL_MS || '30000'));
