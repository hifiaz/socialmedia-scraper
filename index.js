import express from "express";

import {
  getTwitterCount,
  getInstagramCount,
  searchTwitter,
  getYoutube,
  recentInstagram,
  algoliaTwitter,
  deleteTwitter,
  streamTwitter
} from "./lib/scraper";

const app = express();

app.get("/scrape", async (req, res, next) => {
  const [tCount, iCount] = await Promise.all([
    getTwitterCount(),
    getInstagramCount()
  ]);
  res.json({ tCount, iCount });
});

app.get("/twitter", async (req, res, next) => {
  searchTwitter("javascript");
  res.json("Twitter Success Grab Data!");
});
app.get("/twitter-stream", async (req, res, next) => {
  streamTwitter("bank mandiri");
  res.json("Twitter Success Grab Data!");
});

app.get("/youtube", async (req, res, next) => {
  getYoutube("auto2000");
  res.json("Youtube Success Grab Data!");
});

app.get("/ig-recents", async (req, res, next) => {
  recentInstagram("bankmandiri");
  res.json("Instagram Success Grab Data!");
});
app.get("/algolia", async (req, res, next) => {
  algoliaTwitter()
  res.json("Algolia Success Push Data!");
});

app.get("/del-twitter", async (req, res, next) => {
  deleteTwitter()
  res.json("Delete Twitter Success!");
});

app.listen(3000, deets => {
  console.log(`running on http://localhost:3000`);
});
