'use strict';
 
var Users = require('../controllers/users');
 
module.exports = function (app) {
  app.post('/addUser', Users.addUser);
  app.post('/addRating', Users.addRating);
  app.post('/login', Users.login);
};