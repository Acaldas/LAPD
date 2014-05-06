	'use strict';

	var fs = require('fs');
	var DOMParser = require('xmldom').DOMParser;
	var js2xmlparser = require("js2xmlparser");
	var xml2jsparser = require('xml2js');
	var apiKey = 'sqef2dd4hmsbfmh29b5bu7rf';
	var existUsername = "admin";
	var existPassword = "qweasd";
	var request = require('request'); //https://github.com/mikeal/request

	exports.getMovie = function(req, res) {
		res.send(req.params.id);
	};

	exports.getMovies = function(req, res) {
		request.get('http://localhost:8080/exist/rest/db/apps/movies/getMovies.xq', function (error, response, body) {
								if(response.statusCode == 200){

									xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
										 if (err) { 
										    console.log(err);
										  } else {
										    res.send(result.movies);
										  }
									});																			
									} else {
										console.log('error: '+ response.statusCode);
										console.log(body);
									}
		}).auth(existUsername, existPassword, true);

		
	};


	exports.updateMovies = function(req, res) {
		movies_links = [];
		request.get('http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?apikey=' + apiKey + '&?callback=JSON_CALLBACK&country=pt&page_limit=2',
			function (error, response, body) {

	        var response = JSON.parse(body); //remove \n from rottentomatoes API response
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
			
			fs.writeFile("./server/assets/movies/movies.xml",movies_xml, function(err) {
				if(err) {
					console.log(err);
					return;
				}

				//envial movies.xml para exist-db
				fs.createReadStream("./server/assets/movies/movies.xml").pipe(request.put('http://localhost:8080/exist/rest/apps/movies/movies.xml', 
					function (error, response, body) {
						if(response.statusCode == 201){
							console.log('Movies stored.');

							//transform movies with xslt
							request.get('http://localhost:8080/exist/rest/db/apps/movies/transformMovies.xml', function (error, response, body) {
								if(response.statusCode == 200){
										console.log('Movies transformed.');
									} else {
										console.log('error: '+ response.statusCode);
										console.log(body);
									}
							}).auth(existUsername, existPassword, true);
			} else {
						console.log('error: '+ response.statusCode);
						console.log(body);
					}
					}).auth(existUsername, existPassword, true));

	 		movies_links = []; //limpar
	 		movies_set = [];
	 	});
	 }
	};

	 function getMovieInfo(n) {
	 	request.get(movies_links[n] + '?apikey=' + apiKey, function (error, response, body) {
	 			var movie = JSON.parse(body);
		 		getSimilarMovies(n, movie);
		 		//TODO adicionar outras infos, como trailers,etc
		 	});
	 };

	 function getSimilarMovies(n, movie) {
	 	request.get(movie.links.similar + '?apikey=' + apiKey, function (error, response, body) {
	 		var similar_movies = JSON.parse(body);
	 		var similar = [];
		 		similar_movies.movies.forEach(function(similar_movie) {
		 			similar.push({
		 				id: similar_movie.id,
		 				title: similar_movie.title,
		 				link: similar_movie.posters.detailed
		 			})
		 		});
		 		movie.similar = similar;
		 		getMovieSet(n,movie);		
		 	});
	 };
