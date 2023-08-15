import './bootstrap.ts'
import NodeOlxFlatScrapper from "./services/nodeOlxFlatScrapper.ts";

const scrapper = new NodeOlxFlatScrapper();

const intervalMs = parseInt(process.env.INTERVAL_MS || '120000');

scrapper.executeAndCheckInterval(intervalMs);
