'use strict';

var rest = require('restler'); //https://github.com/danwrong/restler


exports.getMovie = function(req, res) {
    res.send(req.params.id);
};

exports.getMovies = function(req, res) {
    var movies = new Array();
    movies[0] = "a";
    movies[1] = "b";
    
    res.jsonp(movies);
};


exports.updateMovies = function(req, res) {
	
	rest.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=sqef2dd4hmsbfmh29b5bu7rf&?callback=JSON_CALLBACK')
	.on('complete', function(data) {
  		res.send(data); // auto convert to object
	});

}
