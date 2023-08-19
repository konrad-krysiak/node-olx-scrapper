import "./bootstrap.ts";
import { NodeOlxFlatScrapper } from "./services/index.ts";

const scrapper = new NodeOlxFlatScrapper();

const intervalMs = parseInt(process.env.INTERVAL_MS || "120000", 10);

scrapper.checkInterval(intervalMs);
