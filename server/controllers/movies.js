'use strict';

var rest = require('restler'); //https://github.com/danwrong/restler
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var js2xmlparser = require("js2xmlparser");
var apiKey = 'sqef2dd4hmsbfmh29b5bu7rf';
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
	movies_links = [];
	rest.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + apiKey + '&?callback=JSON_CALLBACK&country=pt&page_limit=2')
	.on('complete', function(data) {
		var response = JSON.parse(data); //remove \n from rottentomatoes API response


		response.movies.forEach(function(movie) {
			movies_links.push(movie.links.self);

		 });
		movies_links.push('http://api.rottentomatoes.com/api/public/v1.0/movies/770671912.json'); //add Toy Story 3 (testar similar)

		getMovieSet(0,null);
		
  		res.send(response.movies); // auto convert to object
	});

};
	var movies_links = [];
	var movies_set = [];

 function getMovieSet(n, movie) {

 	if(movie != null) {
 			movies_set.push(movie);
 			n += 1;
 	}
 	if(n < movies_links.length ) {
 		getMovieInfo(n);	

 	} else { //já tem todos os filmes
		//r doc = new DOMParser().parseFromString(response); //parse json to XML

		var xml_options = {
		    wrapArray: {
		        enabled: true,
		        elementName: 'movie'
		    }
		};

		var movies_xml = js2xmlparser("movies", JSON.stringify(movies_set), xml_options);

		fs.writeFile("./server/assets/movies/movie2.xml", movies_xml, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
 		
 		movies_links = []; //limpar
 		movies_set = [];
 	}
 };

 function getMovieInfo(n) {
	    rest.get(movies_links[n] + '?apikey=' + apiKey).on('complete', function(data) {
	 		var movie = JSON.parse(data);
	 		//console.log("Filme " + n);
	 		getSimilarMovies(n, movie);

	 		//TODO adicionar outras infos, como trailers
	});
 };

  function getSimilarMovies(n, movie) {
	    rest.get(movie.links.similar + '?apikey=' + apiKey).on('complete', function(data) {
	 		var similar_movies = JSON.parse(data);
	 		var similar = [];
	 		console.log(similar_movies);
	 		similar_movies.movies.forEach(function(similar_movie) {
	 			similar.push({
	 				id: similar_movie.id,
	 				title: similar_movie.title,
	 				link: similar_movie.posters.detailed
	 			})
	 		});
	 		movie.similar = similar;
	 		//console.log("Filme " + n);
			getMovieSet(n,movie);		
	});
 };
