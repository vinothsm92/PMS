
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// var Country = mongoose.model("hc_country", Schema);
var City = mongoose.model("CityName", new Schema({}), "pms_city");

exports.showCityDetails = (req, res) => {


    var stateid = req.params.StateID;
    City.find({ StateId: stateid }, 'CityName StateId', { sort: { CityName: 1 } }, function (err, docs) {

        if (err) {
            console.log(err);
        }
     
            res.json(docs);
      
    }
    )
};

exports.selectCityDetails = (req, res) => {

    City.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        } 
       
            res.json(docs);
      
    }

    )
};



