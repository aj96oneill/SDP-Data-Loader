var request = require('request');
var cheerio = require('cheerio');
const mongo = require('mongodb').MongoClient;
const dburl = 'mongodb://localhost:27017/test';

var result = [{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=career',
  name: 'career',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=major',
  name: 'major',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=interest',
  name: 'interest',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=military',
  name: 'military',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=sports',
  name: 'sports',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=race',
  name: 'race',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=religion',
  name: 'religion',
  values: []
},{
  url: 'http://www.moolahspot.com/local/browse.cfm?cat=state',
  name: 'state',
  values: []
}
];

var y = 0;

function gatherResults(k){
  request(result[k].url, function (err, resp, html) {
    if (err) { return console.error(err) }
    let $ = cheerio.load(html);
    var $scholarships = $('.selectBox') //.text();
    for (var i = 0; i < $scholarships["0"].children.length; ++i) {
      if ($scholarships["0"].children[i].name == "a") {
        let newEnd = $scholarships["0"].children[i].attribs["href"];
        let newUrl = result[k].url.replace(/browse.*/, newEnd);
        let category = $scholarships["0"].children[i].children[0].data.toLowerCase().replace(" and ", " / ").replace(/\([^\d]*[^\d]*\)/g,"").split("/");
        for (var ii = 0; ii < category.length; ii++) {result[k].values.push(category[ii].trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~]/g,""))};
      }
    }
  });
};

console.log("Start of gathering");

setTimeout(function loop(){
  if (y < result.length) {
    gatherResults(y)
    setTimeout(function(){
      y++;
      loop();
    },1000)
  }else{
      console.log("End of gathering");
      // console.log(result);
      mongo.connect(dburl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
        if (err) {return console.error(err)}
        var db = client.db('test');
        db.collection("categories").insertMany(result, function (err, res) {
          if (err) throw err;
          console.log(result.length + " records inserted");
         client.close();
        });
      })
    }
  }, 1000)
