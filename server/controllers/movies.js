		'use strict';

		var fs = require('fs');
		var libxmljs = require("libxmljs");
		var js2xmlparser = require('js2xmlparser');
		var xml2jsparser = require('xml2js'); //https://github.com/polotek/libxmljs/blob/master/docs/Home.md
		var apiKey = 'sqef2dd4hmsbfmh29b5bu7rf';
		var traktApiKey = '15a5b7d3e016c4ea038f03a692565d2b';
		var traktMovieLink = 'http://api.trakt.tv/movie/summary.json/' + traktApiKey + '/tt';
		var traktDefaultUser = "Lapd";
		var traktDefaultPassword = "lapd";
		var existUsername = 'admin';
		var existPassword = 'qweasd';
		var request = require('request'); //https://github.com/mikeal/request
		var original_movies_limit = 50;
		var total_movies_limit = 1000;
		var crypto = require('crypto');

		var movies_links = [];
		var movies_done = [];
		var totalMovies = 0;
		var moviesDone = 0;
		var successMovies = 0;
		var errorMovies = 0;

		exports.updateMovies = function(req, res) {
			request.get('http://api.rottentomatoes.com/api/public/v1.0/dvds/top_rentals.json?apikey=sqef2dd4hmsbfmh29b5bu7rf&imit=' + original_movies_limit,
				function (error, response, body) {
					
					var response = JSON.parse(body); //remove \n from rottentomatoes API response
			        	response.movies.forEach(function(movie) {
			         	movies_links.push(movie.links.self);			        
			         	totalMovies++;
			         });

			    movies_links.push('http://api.rottentomatoes.com/api/public/v1.0/movies/11176484.json'); //add Toy Story 3 (testar similar)
				totalMovies++;

				movies_links.forEach(function (link) {
					getMovieInfo(link, 0);
				});


		  		res.send({status: "updating"}); // auto convert to object
	  		});
	    };

	    var retries = 0;
	    function getMovieInfo(link, generation) {    	
	   //  	if((moviesDone % 50) == 0) {
				// console.log(moviesDone+"\\"+totalMovies);
	   //  	}
	    	
		 	request.get(link + '?apikey=' + apiKey, function (error, response, body) {
		 			var movie = JSON.parse(body);
		 			if(movie.error){	
		 					retries++;
							setTimeout(getMovieInfo(link), 5000);																	
					} else 
			 			getSynopsis(movie, function (movie) {
			 				getSimilarMovies(movie, function (movie){
			 					sendMovieToServer(movie);
			 					moviesDone++;
			 					if(movie.similar && generation<5)
			 						movie.similar.forEach(function (similar){			 							
			 							var similar_link = 'http://api.rottentomatoes.com/api/public/v1.0/movies/' + similar.id + '.json';
			 							if(!containsMovie(similar_link)) {
			 								movies_links.push(similar_link);
			 								getMovieInfo(link, generation+1);
			 								totalMovies++;
			 							}			 							
			 						});
			 					

			 				});
			 			});
			 	});
		}	

		 function sendMovieToServer(movie) {
		 	var xml_options = {
					wrapArray: {
						enabled: true,
						elementName: 'movie'
					},
					declaration : {
						include: false
					}
				};

				var movie_xml = js2xmlparser("movie", movie, xml_options); //convert movie to xml

				var url = 'http://localhost:8080/exist/rest/db/apps/movies/addMovie.xq';

				request.post(url, {form:{query: movie_xml}}, function (error, response, body) { //send to server									
											if(response.statusCode == 200){
												successMovies += 1;
												console.log(successMovies+"/"+totalMovies + "  similar: " + movie.similar.length);
												console.log("Retries: " + retries);
											} else {
												errorMovies += 1
												//console.log("Error adding " + movie.title);
											}

										}).auth(existUsername, existPassword, true);

		 }

		 function getSynopsis(movie, callback) {
		 	if(!movie.synopsis) {
		 		var alternate_ids = movie.alternate_ids;
		 		if(alternate_ids) {
			 		request.get(traktMovieLink + alternate_ids.imdb, function (error, response, body) {
			 			if(response.statusCode == 200) {
			 				var synopsis = JSON.parse(body).overview;
			 				movie.synopsis = synopsis;
			 			}
			 			else
			 				console.log('Error getting synopsis for ' + movie.title);

			 			callback(movie);
			 		});
			 	} else {
			 		console.log(movie.title + ' - No IMDB ID');
			 		callback(movie)
			 	}
		 	} else
		 		callback(movie);
		 }


		function getSimilarMovies(movie, callback) {

		 	request.get(movie.links.similar + '?apikey=' + apiKey, function (error, response, body) {
				var similar_movies = JSON.parse(body);
		 		if(similar_movies.error){
		 					retries++;
							setTimeout(function() {
						    getSimilarMovies(movie,callback)
						}, 10000);													
					} else {	 	

		 			var similar = [];		 			
			 		similar_movies.movies.forEach(function(similar_movie) {

			 			similar.push({
			 				id: similar_movie.id,
			 				title: similar_movie.title,
			 				poster: similar_movie.posters.detailed
			 			});
			 						 		 
			 		});
			 		movie.similar = similar;
			 		callback(movie);
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

		     for (i = 0; movies_done.length > i; i += 1) {
		        if (movies_done[i] === movie) {
		            return true;
		        }
		    }	     
		    return false;
		};

		function deleteMovie(movie) {
		    var i = null;
		    for (i = 0; movies_links.length > i; i += 1) {
		        if (movies_links[i] === movie) {
		        	movies_done.splice(i, 1);
		            return true;
		        }
		    }	     
		    return false;
		};

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
			var start = req.body.start;
			var max = req.body.max;
			var filterType = req.body.filterType;

			url += '?max=' + max;

			if(filter)
				url += '&filter=' + filter + '&filterType=' + filterType;

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


		exports.getSpecialList  = function( req, res) {
			/*
				type = 1, get Most Rated
				type = 2, get Best Rated
				type = 3, get Top movies by genre
			*/
			var query = "";
			var type = req.params.type;
			if(type == 1)
				query = "getMostRated.xq";
			else if(type == 2)
				query = "getBestRated.xq";
			else if(type == 3)
				query = "getGenreMovies.xq"

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

		exports.synchronizeTrakt = function( req, res) {
			var body = req.body;
			var user = body.user;
			var traktUser = body.traktUser;
			var password = body.traktPassword;

			if(user != null && traktUser != null && password != null) {
				var traktPassword = crypto.createHash('sha1').update(password, 'utf8').digest('hex');


				getTraktRatings(traktUser, traktPassword, function(result) { //get trakt ratings

					var traktRatings = result;
					var ratings = '<ratings>';
					traktRatings.forEach(function (traktRating){
						ratings += '<rating>';
						ratings += '<imdb>'+  traktRating.imdb_id.substring(2) + '</imdb>';						
						ratings += '<grade>'+ Math.round(traktRating.rating_advanced/2) + '</grade>';	
						ratings += '<trakt_id>' + traktRating.inserted + '</trakt_id>';			
						ratings += '</rating>';
					});
					ratings += '</ratings>';

					var url = 'http://localhost:8080/exist/rest/db/apps/movies/addTraktRatings.xq';					
					var date = new Date();
					var dateString = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

					//add them to our database
			request.post(url, {form:{user: user, traktuser: traktUser, traktpassword: traktPassword, date:dateString, query: ratings}} ,function (error, response, body) {  //get our ids for trakt.tv rating
				if(response.statusCode == 200){

					xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						 	res.send(err);
						  } else {
						  	res.send(result);
						  }
					});																			
					} else {
						console.log('error: '+ response.statusCode);
						res.send(body);
					}
			}).auth(existUsername, existPassword, true);					
				});

			}
		} 

		//gets trakt ratings and adds them to our database, returns trakt ratings added
		function getTraktRatings(traktUser, traktPassword, returnRequest) {

			var url = 'http://api.trakt.tv/user/ratings/movies.json/' + traktApiKey;

			url += '/' + traktUser;

			request.get(url, function (error, response, body) { //get trakt.tv ratings
				if(response.statusCode == 200){
					var traktRatings = JSON.parse(body);
					returnRequest(traktRatings);
					} else {
						returnRequest(body);
					}
			});			
		}


		exports.getRecomendation = function( req, res) {

			var username = req.body.user;
			var url = 'http://localhost:8080/exist/rest/db/apps/movies/getUserRatings.xq?user=' + username;

			request.get(url, function (error, response, body) { //get user ratings
				if(response.statusCode == 200){

					xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						    console.log(err);
						  } else {
						  	var user = result.user;
						  	var traktUser = traktDefaultUser;
						  	var traktPassword = crypto.createHash('sha1').update(traktDefaultPassword, 'utf8').digest('hex');
						  	if(!user) {
						  		res.send({Error: "Error"});
						  		return;
						  	} else if(user.traktUser && user.traktPassword) {	//if user exists and has a recorded trakt account, use it
						  		traktUser = user.traktUser;
						  		traktPassword = user.traktPassword;
						  	}

						  	getTraktWatched(traktUser, traktPassword, function (result){ //get existing trakt ratings

						  		var traktWatched = result;

						  		sendTraktWatched(traktWatched, true, traktUser, traktPassword, function (result){ //clean existing trakt ratings

						  			sendTraktWatched(user.rating, false, traktUser, traktPassword, function (result){ //insert our ratings in trakt

						  				var auth = {username: traktUser, password: traktPassword};
						  				var getRecomendationUrl = 'http://api.trakt.tv/recommendations/movies/' + traktApiKey;

						  				request.post(getRecomendationUrl, function (error, response, body){ //get recomendations from trakt
						  					var recommendations = JSON.parse(body);
						  					var getMovies = '<movies>';
						  					recommendations.forEach(function(movie){	
						  						var movieXml = '<movie><imdb>' + movie.imdb_id.substring(2) + '</imdb></movie>';
						  						getMovies += movieXml;
						  					});
						  					getMovies += '</movies>';

						  					var getMoviesUrl = 'http://localhost:8080/exist/rest/db/apps/movies/getImdbMovies.xq';

										request.post(getMoviesUrl, {form: {query: getMovies}}, function (error, response, body) { //get user ratings											
											if(response.statusCode == 200){

												xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
													 if (err) { 
													    console.log(err);
													    res.send({error: "Error"});
													  } else {
													  	res.send(result.movies);
													  }})
											} else
												res.send({error: "Error"});
										}).auth(existUsername, existPassword, true);

									}).auth(traktUser,traktPassword);
						  				
						  			});
						  		});						  		
						  		
						  	});					    	
						  	
						  }
					});																			
					} else {
						console.log('error: '+ response.statusCode);
						console.log(body);
					}
			}).auth(existUsername, existPassword, true);
		};

		//sends ratings to trakt, if unrate deletes them
		function sendTraktWatched(ratings, unseen, traktUser, traktPassword, callback) {
			var rateMoviesUrl = ''
			var traktRatings = [];			
			if(!ratings) {
				callback(null);
				return;
			}
			
			if(unseen)
				rateMoviesUrl = 'http://api.trakt.tv/movie/unseen/' + traktApiKey;
			else 
				rateMoviesUrl = 'http://api.trakt.tv/movie/seen/' + traktApiKey;
			


			ratings = [].concat( ratings );
			ratings.forEach(function (rating) {
				var traktRating = {};
		
				traktRating.title = rating.title;
				traktRating.year = rating.year;	
				
				if(unseen)
					traktRating.imdb_id = rating.imdb_id;
				else
					traktRating.imdb_id = 'tt' + rating.imdb;

				traktRatings.push(traktRating);
			});

			var body = {username: traktUser, password: traktPassword, movies: traktRatings};
			request.post({url: rateMoviesUrl, form: body }  ,function (error, response, body) { //clean trakt ratings	
							callback(body);
						});
		}

		//gets trakt watched list
		function getTraktWatched(traktUser, traktPassword, callback) {

			var url = 'http://api.trakt.tv/user/library/movies/watched.json/' + traktApiKey;

			url += '/' + traktUser;

			request.get(url, function (error, response, body) { //get trakt.tv ratings
				if(response.statusCode == 200){
					var traktWatched = JSON.parse(body);
					callback(traktWatched);
					} else {
						returnRequest(body);
					}
			});			
		}