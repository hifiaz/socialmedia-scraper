import cron from "node-cron";
import { runCron, runAlgolia, runDelete, runStream } from "./scraper";

cron.schedule("*/30 * * * *", () => {
  console.log("Running Cron");
  runCron();
});

cron.schedule("*/20 * * * *", () => {
  console.log("Running Cron");
  runStream();
}).start();

cron.schedule("*/21 * * * *", () => {
  console.log("will not execute anymore, nor be able to restart");
  runStream();
}).stop();

cron.schedule("0 * * * *", () => {
  console.log("Running Algolia Cron");
  runAlgolia();
});

cron.schedule("5 * * * *", () => {
  console.log("Running Delete Cron");
  runDelete();
});
