
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Country = mongoose.model("CountryName", new Schema({}), "pms_country");

exports.showCountryDetails = (req, res) => {
  Country.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    }
   
      res.json(docs);
   
  }

  )
};



