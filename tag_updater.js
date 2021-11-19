const mongo = require('mongodb').MongoClient;
const dburl = 'mongodb://localhost:27017/test';
var csv = require('csv');
var obj = csv();

//Connects to the database and loops through "data.csv" to update the three tags
mongo.connect(dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err, client) => {
  if (err) {return console.error(err)}
  var db = client.db('test');
  obj.from.path('data.csv').to.array(function (data) {
    for (var index = 0; index < data.length; index++) {
      db.collection("scholarships").updateOne({name:data[index][0]},{
        $set : {
          student_education : data[index][-5],
          citizenship : data[index][-4],
          stem : data[index][-3]
        }
      });
    }
  });
  client.close();
});
//The csv column format I used is from the csv I downloaded after a scholarship search, if the csv columns are different than expected than the second index for data is used for column number
