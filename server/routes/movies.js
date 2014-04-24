'use strict';
 
var Movies = require('../controllers/movies');
 
module.exports = function (app) {
  app.get('/getMovie/:id', Movies.getMovie);
  app.get('/getMovie', Movies.getMovies);
};