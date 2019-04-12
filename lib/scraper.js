import axios from "axios";
import cherrio from "cheerio";
import search from "scrape-youtube";
import sentimentAnalysis from "sentiment-analysis";
import twitter from "twitter";
import algoliasearch from "algoliasearch";
import { db, twSearch, yt, igr } from "./db";
import "../lib/cron";
import "dotenv/config";

require("./stopWords");

const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

let clients = algoliasearch(process.env.APP_ID, process.env.APP_KEY);

export async function getHTML(url) {
  const { data: html } = await axios.get(url);
  return html;
}

// Twitter Count
export async function getTwitter(html) {
  const $ = cherrio.load(html);
  const span = $("[data-nav='followers'] .ProfileNav-value");
  return span.data("count");
}

// Twitter Search
export async function searchTwitter(keyword) {
  client.get("search/tweets", { q: keyword }, function(error, twits) {
    let response = twits.statuses;
    response.forEach(item => {
      var twit = "twitter";
      if (item.extended_tweet === undefined) {
        twit = item.text;
      } else {
        twit = item.extended_tweet.full_text;
      }
      const removewo = twit.removeStopWords();
      const sentiment = sentimentAnalysis(removewo);

      let overallSentiment = "neutral";
      if (sentiment > 0.2) overallSentiment = "positive";
      else if (sentiment < -0.2) overallSentiment = "negative";

      const persentageScore = `${sentiment * 100}%`;
      const twsearch = twSearch
        .get("twitter")
        .push({
          id: item.id,
          objectID: item.id,
          text: twit,
          created_at: Date.parse(item.created_at),
          source: item.source,
          user: {
            id: item.user.id,
            name: item.user.name,
            screen_name: item.user.screen_name,
            description: item.user.description,
            location: item.user.location,
            followers_count: item.user.followers_count,
            friends_count: item.user.friends_count,
            favourites_count: item.user.favourites_count,
            created_at: Date.parse(item.user.created_at),
            statuses_count: item.user.statuses_count,
            lang: item.user.lang,
            profile_image_url: item.user.profile_image_url
          },
          location: {
            geo: item.geo,
            coordinates: item.coordinates,
            place: item.place
          },
          quote_count: item.quote_count || null,
          reply_count: item.reply_count || null,
          retweet_count: item.retweet_count,
          favorite_count: item.favorite_count,
          sentiment: overallSentiment,
          sentiment_score: persentageScore
        })
        .uniqBy("id")
        .value();
      twSearch.set("twitter", twsearch).write();
    });
    return response;
  });
}

// Instagram Count
export async function getInstagram(html) {
  const $ = cherrio.load(html);
  const dataInString = $("script[type='application/ld+json']").html();
  const pageObject = JSON.parse(dataInString);
  return parseInt(
    pageObject.mainEntityofPage.interactionStatistic.userInteractionCount
  );
}

export async function recentInstagram(keyword) {
  const html = await getHTML(
    `https://www.instagram.com/explore/tags/${keyword}/?__a=1`
  );
  const ig = html.graphql.hashtag.edge_hashtag_to_media.edges;
  ig.forEach(item => {
    const cleanWord = item.node.edge_media_to_caption.edges[0].node.text.removeStopWords();
    const sentiment = sentimentAnalysis(cleanWord);

    let overallSentiment = "neutral";
    if (sentiment > 0.2) overallSentiment = "positive";
    else if (sentiment < -0.2) overallSentiment = "negative";

    const persentageScore = `${sentiment * 100}%`;
    const igrecent = igr
      .get("instagram")
      .push({
        id: item.node.id,
        objectID: item.node.id,
        owner: item.node.owner.id,
        shortcode: item.shortcode,
        caption: item.node.edge_media_to_caption.edges[0].node.text,
        comment: item.node.edge_media_to_comment.count,
        created_at: item.node.taken_at_timestamp,
        display: item.node.display_url,
        like: item.node.edge_liked_by.count,
        preview: item.node.edge_media_preview_like.count,
        video_count: item.node.video_view_count,
        accessibility_caption: item.node.accessibility_caption,
        sentiment: overallSentiment,
        sentiment_score: persentageScore
      })
      .uniqBy("id")
      .value();
    igr.set("instagram", igrecent).write();
    return igr;
  });
}

// Youtube Search
export async function getYoutube(keyword) {
  search(keyword).then(results => {
    results.forEach(element => {
      let isWordClean;
      if (element.description != null) {
        isWordClean = element.description.removeStopWords();
      }

      const sentiment = sentimentAnalysis(isWordClean);
      let overallSentiment = "neutral";
      if (sentiment > 0.2) overallSentiment = "positive";
      else if (sentiment < -0.2) overallSentiment = "negative";

      const persentageScore = `${sentiment * 100}%`;
      const objectID = Math.random()
        .toString(36)
        .substring(2);
      const youtube = yt
        .get("youtube")
        .push({
          ...element,
          objectID,
          sentiment: overallSentiment,
          sentiment_score: persentageScore
        })
        .uniqBy("link")
        .value();
      yt.set("youtube", youtube).write();
    });
    return results;
  });
}

export async function getTwitterCount() {
  const html = await getHTML("https://twitter.com/hifiaz");
  const tCount = await getTwitter(html);
  return tCount;
}

export async function getInstagramCount() {
  const html = await getHTML("https://www.instagram.com/luthfiazharifi");
  const iCount = await getInstagram(html);
  return iCount;
}

export function algoliaTwitter() {
  const index = clients.initIndex("twitter");
  const records = require("../dbTSearch.json");
  index.addObjects(records.twitter);
}

export function algoliaInstagram() {
  const index = clients.initIndex("instagram");
  const records = require("../dbIGRecent.json");
  index.addObjects(records.instagram);
}

export function algoliaYoutube() {
  const index = clients.initIndex("youtube");
  const records = require("../dbYoutube.json");
  index.addObjects(records.youtube);
}

export function deleteTwitter() {
  twSearch
    .get("twitter")
    .remove()
    .write();
  return twSearch;
}
export function deleteIG() {
  igr
    .get("instagram")
    .remove()
    .write();
  return igr;
}
export function deleteYT() {
  yt.get("youtube")
    .remove()
    .write();
  return yt;
}

// Cron Jobs
export async function runCron() {
  // const [tCount, iCount] = await Promise.all([
  //   getTwitterCount(),
  //   getInstagramCount()
  // ]);
  // db.get("twitter")
  //   .push({
  //     date: Date.now(),
  //     count: tCount
  //   })
  //   .write();
  // db.get("instagram")
  //   .push({
  //     date: Date.now(),
  //     count: iCount
  //   })
  //   .write();
  searchTwitter("bankmandiri");
  recentInstagram("bankmandiri");
  getYoutube("bankmandiri");
  console.log("done scrap");
}

export async function runAlgolia() {
  algoliaTwitter();
  algoliaInstagram();
  algoliaYoutube();
  console.log("done push");
}

export async function runDelete() {
  deleteTwitter();
  deleteIG();
  deleteYT();
  console.log("done delete");
}
