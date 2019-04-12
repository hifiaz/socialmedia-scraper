// import algoliasearch from "algoliasearch";
import { twSearch } from "./db";
let client = algoliasearch("UICDETTDUD", "fe270f051c26a7ed4c76b9a3aa97206e");
const index = client.initIndex('twitter');

const records = require("../dbTSearch.json");
index.addObjects(records.twitter);
console.log(records.twitter);

twSearch.get("twitter")
  .remove()
  .write();
