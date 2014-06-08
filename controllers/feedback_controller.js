var db = require('../models');
var async = require('async');

exports.listAllFeedback = function (req, res) {
  var admin = req.user.id;

  db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
    if (err) {
      console.log(err);
    }
    if (restaurant) {
      
      db.Feedback.find({ restaurant : restaurant }, function(err,feedback){

        var feedbacks = [];

        if(err) cosole.log(err);
        //Fetch user info
        async.each(feedback, function(f, callback){

          db.User.findOne({ id : f.user }, function(err, user){
            feedbacks.push({ user : user.name, dateEntered : f.dateEntered, feedback : f.feedback });
            callback();
          });     

        }, function(err){

          if(err) console.log(err);
          res.json(feedbacks);

        })      

      })

    } else {

      res.json({ result: false });
    }
  });
};