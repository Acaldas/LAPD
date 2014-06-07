'use strict';
 
angular.module('mean.movies').controller('MoviesMainController', ['$scope', '$stateParams', '$location', '$timeout', '$http', 'Global','Movies', 'Users',
  function($scope, $stateParams, $location,  $timeout, $http, Global, Movies, Users) {
    $scope.global = Global;
    $scope.error = "";
    $scope.filterText = '';

    $scope.setMovie = function(movie){
         $location.path('/movies/' + movie.id); 
    };


    $scope.synchronizeTrakt = function(user, traktUser, traktPassword) {
      Movies.synchronizeTrakt.query({},{user: user, traktUser: traktUser, traktPassword: traktPassword}, function (response){ 
        console.log(response);
      });
    }

    $scope.synchronizeTrakt("Teste1", "Acaldas", "qweasd");
    // Users.addUser.query({},{name: "Aaa", password: "bbb"}, function (response) {
    //   console.log(response);
    // });     
  
    // Users.addRating.query({},{user: "Teste", movie: 771250004, grade: 4}, function (response) {
    //   console.log(response);
    // });

  
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

    var filterTextTimeout;
    var start = 1;
    var max = 20;

    var filter;
    $scope.getMovies = function () {
      Movies.getMovies.query({},{start: start, filter: filter}, function (response){ 
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

    $scope.getMoreMovies = function () {
      console.log("aaa");
       start += 20;
    };

    $scope.$watch('searchText', function (val) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);
        filter = val;
        filterTextTimeout = $timeout($scope.getMovies, 200); // delay 250 ms
    }); 
      // $scope.update = Movies.update.query(function(response) {
      // Movies.getMovies.query(function (response){ 
      //    $scope.movies = response.movie;
      //  });
      //  }); //get movies
  }
])
.controller('MovieController', ['$scope', '$location', '$stateParams', 'Movies', function($scope, $location, $stateParams, Movies) {
  
  Movies.getMovies.get({},{'id': $stateParams.id}, function (response){
    $scope.error = response.error;
    $scope.movie = response;                          
    $scope.similar_movies = response.similar_movies.similar_movie;

    $scope.setMovie = function(movie){
           $location.path('/movies/' + movie.id); 
      };    
  });            

}]);