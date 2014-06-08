'use strict';
 
var Movies = require('../controllers/movies');
 
module.exports = function (app) {
  app.get('/getMovies/:id', Movies.getMovie);
  app.post('/getMovies', Movies.getMovies);
  app.post('/updateMovies', Movies.updateMovies);
  app.get('/getSpecialList/:type', Movies.getSpecialList);
  app.post('/synchronizeTrakt', Movies.synchronizeTrakt);
  app.post('/getRecomendation', Movies.getRecomendation);
};