'use strict';
 
angular.module('mean.movies').controller('MoviesMainController', ['$scope', '$stateParams', '$location', '$timeout', '$http', 'Global','Movies',
  function($scope, $stateParams, $location,  $timeout, $http, Global, Movies) {
    $scope.global = Global;
      
      $scope.setMovie = function(movie){
           $location.path('/movies/' + movie.id); 
      };

      $scope.filterText = '';

      var filterTextTimeout;
    $scope.$watch('searchText', function (val) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        filterTextTimeout = $timeout(function() {
            Movies.getMovies.query({},{filter: val}, function (response){ 

              if(response.movie.length) //check if search returned various movies or only one
                $scope.movies = response.movie;    
              else
                $scope.movies = response;
            });
        }, 200); // delay 250 ms
    });
      // Get movie with id 1
      //$scope.test = Movies.getMovies.get({},{'id': 1}); //http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html

     // $scope.update = Movies.update.query(function(response) {});
      //    Movies.getMovies.query(function (response){ 
      //   $scope.movies = response.movie;
      // });
      // }); //get movies
  }
])
.controller('MovieController', ['$scope', '$location', '$stateParams', 'Movies', function($scope, $location, $stateParams, Movies) {
  
  Movies.getMovies.get({},{'id': $stateParams.id}, function (response){
    $scope.movie = response;                          
    $scope.similar_movies = response.similar_movies;

    $scope.setMovie = function(movie){
           $location.path('/movies/' + movie.id); 
      };    
  });            

}]);