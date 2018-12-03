
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// var Country = mongoose.model("hc_country", Schema);
var State = mongoose.model("StateName", new Schema({}), "pms_state");

exports.showStateDetails = (req, res) => {

  var countryid = req.params.CountryID;

  State.find({ CountryId: countryid }, 'StateName CountryId', { sort: { StateName: 1 } }, function (err, docs) {
    if (err) {
      console.log(err);
    }

    res.json(docs);

  }
  )
};

exports.selectStateDetails = (req, res) => {
  State.find({}, function (err, docs) {
    if (err) {
      console.log(err);
    }

    res.json(docs);

  }

  )
};



