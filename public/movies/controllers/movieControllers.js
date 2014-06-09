'use strict';
 
angular.module('mean.movies').controller('MoviesMainController', ['$scope', '$stateParams', '$location', '$timeout', '$http', 'Global','Movies', 'Users',
  function($scope, $stateParams, $location,  $timeout, $http, Global, Movies, Users) {
    $scope.global = Global;
    $scope.error = "";
    $scope.filterText = '';

    $scope.user = "";

    $scope.setMovie = function(movie){
         $location.path('/movies/' + movie.id); 
    };


    //get user watched list
    $scope.getUserWatchedList = function(user) {
       Movies.getUserRatings.get({},{'user': user}, function (response){
          $scope.watched_list = response.ratings;
          console.log(response);
       });
    }

    //$scope.getUserWatchedList("Teste1");

    //returns movie ratings returned from Trakt
    $scope.synchronizeTrakt = function(user, traktUser, traktPassword) {
      Movies.synchronizeTrakt.query({},{user: user, traktUser: traktUser, traktPassword: traktPassword}, function (response){ 
        console.log(response);
      });
    }

    //synchronize ratings
    //$scope.synchronizeTrakt("Teste1", "Acaldas", "qweasd");

    //get recomendation
    $scope.getRecomendation = function(user) {
      Movies.getRecomendation.query({},{user: user}, function (response){ 
        $scope.recomendation_movies = response.movie;
      });
    }

    //$scope.getRecomendation("Teste1");

    $scope.login = function(name, password) {
      Users.login.query({},{name: name, password: password}, function (response) {
        console.log(response);
        $scope.status = response.status;
        if($scope.status === "Success")
          $scope.user = {user: name, password: password};
      });
    }

    $scope.addUser = function(name, password) {
      Users.addUser.query({},{name: name, password: password}, function (response) {
        console.log(response);
      }); 
    }
        
    $scope.addRating = function(user, movieId, grade) {
    Users.addRating.query({},{user: user, movie: movieId, grade: grade}, function (response) {
      console.log(response);
    });
  }
  
  $scope.quickMovie = null;
  $scope.showQuickMovie = false;

  //set quick description movie
  $scope.setQuickMovie = function(movie){ 
    Movies.getMovies.get({},{'id': movie.id}, function (response){                         
      $scope.quick_similar_movies = response.similar_movies.similar_movie;
      $scope.quickMovie = response;
      $scope.showQuickMovie = true;
    });             
  };
  $scope.hideQuickMovie = function() {
     $scope.showQuickMovie = false;
  };


  //get most rated movies
  Movies.getSpecialList.get({},{'type': 1}, function (response){
      $scope.mostRatedMovies = response.most_rated.movie;
    });

  //get best rated movies
  Movies.getSpecialList.get({},{'type': 2}, function (response){
      $scope.bestRatedMovies = response.best_rated.movie;
    });

  //get top movies by genre
  Movies.getSpecialList.get({},{'type': 3}, function (response){
      $scope.bestGenreMovies = response.genres;
    });

    $scope.filterTypes = [
     { id: 1, name: 'Everything' },
     { id: 2, name: 'Title' },
     { id: 3, name: 'Synopsis' },
     { id: 4, name: 'Actor' },
     { id: 5, name: 'Director' }
   ];

   $scope.selectedFilterType = $scope.filterTypes[0];
    var filterTextTimeout;
    var start = 1;
    var max = 20;

    var filter;
    $scope.getMovies = function () {
      Movies.getMovies.query({},{start: start, filter: filter, filterType: $scope.selectedFilterType.id}, function (response){ 
        if(response.movie) {//check if some movie was found 
          $scope.error = "";
          if(response.movie.length) //check if search returned various movies or only one
            $scope.movies = response.movie;    
          else
            $scope.movies = response;
        } else {
          $scope.movies = {};
          $scope.error = "No movies found"
        }

      });

    };

    $scope.$watch('searchText', function (val) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filter = val;
        filterTextTimeout = $timeout($scope.getMovies, 200); // delay 250 ms
    }); 

     $scope.$watch('selectedFilterType', function(val) {
      $scope.getMovies();
     });
    
      // $scope.update = Movies.update.query(function(response) {
      // Movies.getMovies.query(function (response){ 
      //     $scope.movies = response.movie;
      //   });
      //   }); //get movies
  }
])
.controller('MovieController', ['$scope', '$location', '$stateParams', 'Movies', function($scope, $location, $stateParams, Movies) {
  
  Movies.getMovies.get({},{'id': $stateParams.id}, function (response){
    $scope.error = response.error;
    $scope.movie = response;                          
    $scope.similar_movies = response.similar_movies.similar_movie;
    $scope.genres = response.genres.genre;
    $scope.cast = response.cast.actor;
    $scope.directors = response.directors.director;

    $scope.setMovie = function(movie){
           $location.path('/movies/' + movie.id); 
      };    
  });            

}]);