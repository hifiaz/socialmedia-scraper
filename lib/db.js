import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

// const adapter = new FileSync("db.json");
// const db = low(adapter);
// db.defaults({ twitter: [], instagram: [], twitterSearch: [] }).write();
export const db = low(new FileSync("db.json"));
export const twSearch = low(new FileSync("dbTSearch.json"));
export const twStream = low(new FileSync("dbTStream.json"));
export const yt = low(new FileSync("dbYoutube.json"));
export const igr = low(new FileSync("dbIGRecent.json"));