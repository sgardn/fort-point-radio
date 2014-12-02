var http = require("http");
var fs = require("fs");
var parseString = require("xml2js").parseString;
var hipchat = require("node-hipchat");
var phantom = require("phantom");
var $ = require("jquery");
var _ = require("underscore");

var API = require("./vars").API;
var roomID = require("./vars").roomID;
var lastFM = require("./vars").lastFM;
var from = require("./vars").from;

var HC = new hipchat(API);
var params = {
  room: roomID,
  from: from,
  color: "green",
}

var alreadyListenedFile = "alreadyListened.txt";

// reset the output file
fs.writeFile(alreadyListenedFile, "", function(err) {
  if (err) console.log("error -- " + err);
});

function clean(t) {
  return {
    name: String(t.name),
    artist: String(t.artist[0]["_"]),
    date: String(t.date[0]["$"].uts)
  }
}

function scrape() {
  http.get(lastFM, function(res) {
    var body = "";
    res.on("data", function(chunk) {
      body += chunk;
    });
    res.on("end", function() {
      parseString(body, function(err, result) {
        tracks = result.recenttracks.track;
        var sorted = _.sortBy(tracks, function(t) {
            return t.date[0]["$"].uts;
        });
        var mostRecent = clean(sorted[sorted.length - 1]);
        var songIdentifier = mostRecent.name + " - " + mostRecent.artist;
        var alreadyListenedSongs = "";

        fs.readFile(alreadyListenedFile, "utf8", function(err, data) {
          if (err) console.log("err! " + err);

          alreadyListenedSongs = data;

          if (alreadyListenedSongs.indexOf(songIdentifier) == -1) {
            fs.appendFile(alreadyListenedFile, songIdentifier);
            console.log("NEW SONG: " + songIdentifier);
            var queryString = mostRecent.artist.split(" ").join("+") + "+" + mostRecent.name.split(" ").join("+")
            var youtubeSearchUri = "http://www.youtube.com/results?search_query=" + queryString;

            phantom.create(function(ph) {
              ph.createPage(function(page) {
                page.open(youtubeSearchUri, function(status) {
                  page.injectJs("node_modules/jquery/dist/jquery.min.js")
                  page.evaluate(function() {
                    return $("ol.item-section > li:nth-child(1) a")[0].href;
                  }, function(url) {
                    params.message = songIdentifier + " <a href='" + String(url) + "''>" + String(url) + "</a>";
                    HC.postMessage(params, function(data) {
                      console.log("message posted to hipchat!");
                      console.log(params.message);
                    });
                  });
                });
              });
            });
          } else {
            console.log("no new songs...");
          }
          setTimeout(scrape, 3000);
        });
      });
    });
  }).on("error", function(e) {
    console.log("Got error: " + e.message);
  });
}

scrape();
