var request = require('request');
var cheerio = require('cheerio');
const mongo = require('mongodb').MongoClient;
const dburl = 'mongodb://localhost:27017/test';

var result = [];
var newObjs = [];
var x = 0;
var y = 0;

const urls = ['http://www.moolahspot.com/local/browse.cfm?cat=career',
              'http://www.moolahspot.com/local/browse.cfm?cat=major',
              'http://www.moolahspot.com/local/browse.cfm?cat=interest',
              'http://www.moolahspot.com/local/browse.cfm?cat=military',
              'http://www.moolahspot.com/local/browse.cfm?cat=sports',
              'http://www.moolahspot.com/local/browse.cfm?cat=race',
              'http://www.moolahspot.com/local/browse.cfm?cat=religion',
              'http://www.moolahspot.com/local/browse.cfm?cat=state'
            ];

function gatherResults(k){
  request(urls[k], function (err, resp, html) {
    if (err) { return console.error(err) }
    let $ = cheerio.load(html);
    var $scholarships = $('.selectBox') //.text();
    for (var i = 0; i < $scholarships["0"].children.length; ++i) {
      if ($scholarships["0"].children[i].name == "a") {
        let newEnd = $scholarships["0"].children[i].attribs["href"];
        let newUrl = urls[k].replace(/browse.*/, newEnd);
        let category = $scholarships["0"].children[i].children[0].data.toLowerCase().replace(" and ", " / ").replace(/\([^\d]*[^\d]*\)/g,"").split("/");
        for (var ii = 0; ii < category.length; ii++) {category[ii] = category[ii].trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~]/g,"")};
        result.push({
          url : newUrl,
          cat : category
        });
      }
    }
  });
};

function gatherData(k){
  request(result[k]["url"], function (err, resp, html) {
    if (err) { return console.error(err) }
    var $new = cheerio.load(html);
    var $ships = $new('.box');
    for (var j = 0; j < $ships.length; ++j) {
      var lines = $ships.eq(j).text().split('\n');
      cObj = {
        name: lines[1],
        sponsor: lines[2],
        address: lines[3] + " " + lines[4] + " " + lines[6],
        elegibility: lines[7],
        amount: lines[8],
        deadline: lines[9],
        how: lines[10],
        web: (lines[11] || "").replace("Website: ", ""),
        tags: result[k]["cat"]
      };
      newObjs.push(cObj)
    }
  });
};

console.log("Starting Tool");
console.log("Process takes about 7 minutes to finish");

setTimeout(function loop(){
  if (y < urls.length) {
    gatherResults(y)
    setTimeout(function(){
      // console.log(result.length);
      y++;
      loop();
    },1000)
  }else{
    if (x < result.length){
      gatherData(x)
      setTimeout(function(){
        // console.log(newObjs.length);
        x++;
        console.log("Working on " + x + " out of " + result.length);
        loop();
      },1000)
    }else {
      console.log("End of gathering");
      mongo.connect(dburl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
        if (err) {return console.error(err)}
        var db = client.db('test');
        // console.log(newObjs);
        db.collection("scholarships").insertMany(newObjs, function (err, res) {
          if (err) throw err;
          console.log(newObjs.length + " scholarships inserted");
         client.close();
        });
      })
    }
  }
}, 1000)
//Aprox. 10349
