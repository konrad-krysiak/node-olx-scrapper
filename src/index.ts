import './bootstrap.ts'
import NodeOlxFlatScrapper from "./services/nodeOlxFlatScrapper.ts";

const scrapper = new NodeOlxFlatScrapper();
// scrapper.prefillState(5);

setInterval(() => {
  scrapper.executeAndCheck();
}, parseInt(process.env.INTERVAL_MS || '30000'));
