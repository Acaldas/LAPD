'use strict';


exports.getMovie = function(req, res) {
//  var movie = req.body;
    res.jsonp(1);
//  res.jsonp(movie);
//  bucketList.save(function(err) {
//    if (err) {
//      console.log(err);
//    } else {
//      res.jsonp(bucketList);
//    }
//  }
//    );
};

exports.getMovies = function(req, res) {
    var movies = new Array();
    movies[0] = "a";
    movies[1] = "b";
    
    res.jsonp(movies);
};
