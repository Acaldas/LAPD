		'use strict';

		var fs = require('fs');
		var libxmljs = require("libxmljs");
		var js2xmlparser = require('js2xmlparser');
		var xml2jsparser = require('xml2js'); //https://github.com/polotek/libxmljs/blob/master/docs/Home.md
		var apiKey = 'sqef2dd4hmsbfmh29b5bu7rf';
		var trackMovieLink = 'http://api.trakt.tv/movie/summary.json/15a5b7d3e016c4ea038f03a692565d2b/tt';
		var existUsername = 'admin';
		var existPassword = 'qweasd';
		var request = require('request'); //https://github.com/mikeal/request
		var original_movies_limit = 30;
		var total_movies_limit = 200;

		exports.getMovie = function(req, res) {
			var xpath = { _query: '//movie[id=' + req.params.id + ']',
						  _wrap: 'no'};

			request.get({url:'http://localhost:8080/exist/rest/db/apps/movies/movies.xml', qs: xpath},  function (error, response, body) {
				if(response.statusCode == 200 && body != ""){
					xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						    console.log(err);
						  } else {
						    res.send(result.movie);
						  }
					});																			
					} else {										
						console.log('error: '+ response.statusCode);
						console.log(body);
						res.send({error: "This movie doesn't exist!"});
					}
			}).auth(existUsername, existPassword, true);
		};

		exports.getMovies = function(req, res) {
			var url = 'http://localhost:8080/exist/rest/db/apps/movies/getMovies.xq';
			var filter = req.body.filter;
			if(filter)
				url += '?filter=' + filter;

			request.get(url, function (error, response, body) {
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

		function createQuery(start) {

			fs.readFile('./server/assets/movies/getMoviesTitles.xml', 'utf8', function (err,data) {
			if (err) 
			    return console.log(err);

			console.log(data);
			var doc = libxmljs.parseXml(data);
			console.log(doc);
			});		
		};

		exports.updateMovies = function(req, res) {
			request.get('http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/top_rentals.json?apikey=' + apiKey
						 + '&?callback=JSON_CALLBACK&country=pt&limit=' + original_movies_limit,
				function (error, response, body) {
					
					var response = JSON.parse(body); //remove \n from rottentomatoes API response
			        response.movies.forEach(function(movie) {
			        	movies_links.push(movie.links.self);
			        	totalMovies++;
			        });

			    movies_links.push('http://api.rottentomatoes.com/api/public/v1.0/movies/770672122.json'); //add Toy Story 3 (testar similar)
				totalMovies++;
				getMovieSet(0,null);
				start = new Date().getTime() / 1000;
		  		res.send(response.movies); // auto convert to object
	  		});
	    };

	    var movies_set = []
		var movies_links = [];
		var totalMovies = 0;
		var errors = 0;
	    var start;
	    var synopsisMissing = 0;

	    function resetVars() {
	    	movies_links = [];
	    	movies_set = [];
			totalMovies = 0;
			errors = 0;
			start = 0;
			synopsisMissing = 0;
	    }

		function getMovieSet(n, movie) {
			if(movie != null) {
				movies_set.push(movie);
				n += 1;
				if((n % 50) == 0)
				 console.log(n+"\\"+totalMovies + " :" + movie.title);
			}
			if(n < movies_links.length ) {
				getMovieInfo(n);	

		 	} else { //já tem todos os filmes
				
				var end = new Date().getTime() / 1000;

				console.log(" Done in " + (end - start) + " seconds." + n + '/' + movies_links.length);

				console.log("Movies_links: " + movies_links.length);
				console.log("totalMovies: " + totalMovies);
			    console.log("errors: " + errors);
			    console.log("done: " + n);
				
				var xml_options = {
					wrapArray: {
						enabled: true,
						elementName: 'movie'
					}
				};

				var movies_xml = js2xmlparser("movies", JSON.stringify(movies_set), xml_options);
				
				resetVars();

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

		 		resetVars();
		 	});
		 }
		};

		 function getMovieInfo(n) {
		 	request.get(movies_links[n] + '?apikey=' + apiKey, function (error, response, body) {
		 			var movie = JSON.parse(body);
		 			if(movie.error){
							errors++;
							console.log("Error getting " + movie_links[n]);
					} else 
			 			getExtraInfo(0,n,movie);
			 	});
		 };

		 function getExtraInfo(step, n, movie) {
		 	switch(step) {
		 		case 0:
		 			getSimilarMovies(n, movie);	 			
		 			break;
		 		case 1: 
		 				getSynopsis(n, movie);	 
		 			break;
		 		case 2:
		 			getMovieSet(n,movie);
		 			break;	 		
		 	}
		 	//TODO adicionar outras infos, como trailers,etc
		 };

		 function getSynopsis(n, movie) {
		 	if(!movie.synopsis) {
		 		synopsisMissing++;
		 		var alternate_ids = movie.alternate_ids;
		 		if(alternate_ids) {
			 		request.get(trackMovieLink + alternate_ids.imdb, function (error, response, body) {
			 			if(response.statusCode == 200) {
			 				var synopsis = JSON.parse(body).overview;
			 				movie.synopsis = synopsis;
			 				if(synopsis)
			 					synopsisMissing--;
			 			}
			 			else
			 				console.log('Error getting synopsis for ' + movie.title);

			 			getExtraInfo(2, n, movie);
			 		});
			 	} else {
			 		console.log(movie.title + ' - No IMDB ID');
			 		getExtraInfo(2, n, movie);
			 	}
		 	} else
		 		getExtraInfo(2, n, movie);
		 }

		 function getSimilarMovies(n, movie) {
		 	request.get(movie.links.similar + '?apikey=' + apiKey, function (error, response, body) {
				var similar_movies = JSON.parse(body);
		 		if(similar_movies.error){
							errors++;
							console.log("Error getting similar" + movie.links.similar);
					} else {	 		
		 			var similar = [];
			 		similar_movies.movies.forEach(function(similar_movie) {
			 			similar.push({
			 				id: similar_movie.id,
			 				title: similar_movie.title,
			 				poster: similar_movie.posters.detailed
			 			});
			 			var similar_link = 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + similar_movie.id + '.json';
			 			if(!containsMovie(similar_link) && totalMovies < total_movies_limit) {
			 				movies_links.push(similar_link);	
			 				//console.log("Added similar movie: " + similar_movie.title);
			 				totalMovies++;
			 			}
			 		});
			 		movie.similar = similar;
			 		getExtraInfo(1, n, movie);
			 		}		
			 	});
		 };

		 function containsMovie(movie) {
		    var i = null;
		    for (i = 0; movies_links.length > i; i += 1) {
		        if (movies_links[i] === movie) {
		            return true;
		        }
		    }	     
		    return false;
		};

		exports.getSpecialList  = function( req, res) {
			/*
				type = 1, get Most Rated
				type = 2, get Best Rated
			*/
			var query = "";
			var type = req.params.type;
			if(type == 1)
				query = "getMostRated.xq";
			else if(type == 2)
				query = "getBestRated.xq";

			var url = 'http://localhost:8080/exist/rest/db/apps/movies/' + query;

			request.get(url, function (error, response, body) {
				if(response.statusCode == 200){

					xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						    console.log(err);
						  } else {
						    res.send(result);
						  }
					});																			
					} else {
						console.log('error: '+ response.statusCode);
						console.log(body);
					}
			}).auth(existUsername, existPassword, true);

		}