var db = require('../models');

exports.getInitGroupOfTables = function (req, res) {
  var admin = req.user.id;
  db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
    if (restaurant) {
      if (err) {
        console.log(err);
      }
      db.Table.find({ owner: restaurant.id }, function (err, tables) {
        if (err) {
          console.log(err);
        }
        res.json(tables);
      });
    } else {
      res.json({ result: false });
    }
  });
};

exports.getNumbersOfTableType = function (req, res) {
  var admin = req.user.id;
  db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
    if (restaurant) {
      if (err) {
        console.log(err);
      }
      db.Table.find({ owner: restaurant.id, status: req.query.status }, function (err, tables) {
        if (err) {
          console.log(err);
        }
        res.json(tables);
      });
    } else {
      res.json({ result: false });
    }
  });
};

exports.getStartingOrders = function (io) {
  return function (req, res) {
    var admin = req.user.id;
    var tno = req.query.tid;
    db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
      if (err) {
        console.log(err);
      }

      if (restaurant) {
        db.Table.findOne({ owner: restaurant.id, sno: tno, status: 'waiting' }, function (err, table) {
          if (err) {
            console.log(err);
          }

          if (table) {
            db.Visit.findOne({ restaurant: restaurant.id, table: table.id, ended_at: null }, function (err, visit) {
              if (err) {
                console.log(err);
              }

              if (visit) {
                console.log(visit);
                var arr = [];
                var items = visit.items;
                var quans = visit.quan;
                for (var i in items) {
                  (function (k) {
                    var item = items[k];
                    var quans = visit.quan[k]
                    db.Item.findById(item, function (err, itemObj) {
                      if (err) {
                        console.log(err);
                      }

                      if (itemObj) {
                        arr.push({ name: itemObj.name, quantity: quans[k] });
                        if (arr.length == items.length) {
                          io.sockets.emit('food', { evt: 'food', items: arr, table: tno, level: Math.ceil((Math.random() * 10) % 5) });
                        }
                      }
                    });
                  })(i);
                }
              } else {
                res.json({ result: false });
              }
            });
          } else {
            res.json({ result: false });
          }
        });
      } else {
        res.json({ result: false });
      }
    });
  };
}

exports.getCurrentUsers = function (req, res) {
  var admin = req.user.id;
  var max = -1;
  var array = [];

  db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
    if (err) {
      console.log(err);
    }
    if (restaurant) {
      db.Visit.find({ restaurant: restaurant.id, ended_at: null }, function (err, visits) {
        if (err) {
          console.log(err);
        }
        if (visits) {
          var users = [];
          for (var i in visits) {
            var visit = visits[i];

            db.User.findById(visit.user, function (err, user) {
              if (user) {
                if (err) {
                  console.log(err);
                }
                db.Visit.count({ restaurant: restaurant.id, user: user.id }, function (err, count) {
                  if (max < count) {
                    max = count;
                  }
                  users.push({ user_id: user.id, name: user.email, count: count, level: 0 });
                  if (users.length === visits.length) {
                    for (var j in users) {
                      users[j].level = (users[j].count / max * 1.0 ) * 5;
                    }
                    res.json(users);
                  }
                });
              } else {
                res.json({ result: false });
              }
            });
          }
        } else {
          res.json({ result: false });
        }
      });
    } else {
      res.json({ result: false });
    }
  });
};

exports.getUserDetails = function (req, res) {
  var admin = req.user.id;
  var uid = req.query.uid;
  var items_global = {};
  var matrix = [];

  db.Restaurant.findOne({ admin: admin }, function (err, restaurant) {
    if (err) {
      console.log(err);
    }
    if (restaurant) {
      db.Item.find({ restaurant: restaurant.id }, function (err, items) {
        if (err) {
          console.log(err);
        }
        if (items) {
          for (var i in items) {
            items_global[items[i].id] = items[i];
          }
          db.Visit.find({ restaurant: restaurant.id, user: uid }, function (err, visits) {
            if (err) {
              console.log(err);
            }
            if (visits) {
              for (var j in visits) {
                var visit = visits[j];
                for (var k in visit.items) {
                  visits[j].items[k] = items_global[visit.items[k]]
                }
              }
              res.json(visits);
            } else {
              res.json({ result: false });
            }
          });
        } else {
          res.json({ result: false });
        }
      });
    } else {
      res.json({ result: false });
    }
  });

};
