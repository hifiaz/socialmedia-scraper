import cron from "node-cron";
import { runCron, runAlgolia, runDelete } from "./scraper";

cron.schedule("*/30 * * * *", () => {
  console.log("Running Cron");
  runCron();
});
cron.schedule("0 * * * *", () => {
  console.log("Running Algolia Cron");
  runAlgolia();
});

cron.schedule("5 * * * *", () => {
  console.log("Running Delete Cron");
  runAlgolia();
});
