'use strict';
 
angular.module('mean.movies').controller('MoviesMainController', ['$scope', '$stateParams', '$location', '$timeout', '$http', 'Global','Movies', 'Users',
  function($scope, $stateParams, $location,  $timeout, $http, Global, Movies, Users) {
    $scope.global = Global;
    $scope.error = "";
    $scope.filterText = '';

    $scope.setMovie = function(movie){
         $location.path('/movies/' + movie.id); 
    };

    // Users.addUser.query({},{name: "Aaa", password: "bbb"}, function (response) {
    //   console.log(response);
    // });     
  
    // Users.addRating.query({},{user: "Teste", movie: 771250004, grade: 4}, function (response) {
    //   console.log(response);
    // });


  //get most rated movies
  Movies.getSpecialList.get({},{'type': 1}, function (response){
      $scope.mostRatedMovies = response.most_rated.movie;
    });

  //get best rated movies
  Movies.getSpecialList.get({},{'type': 2}, function (response){
      $scope.bestRatedMovies = response.best_rated.movie;
    });

    var filterTextTimeout;
    $scope.$watch('searchText', function (val) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        filterTextTimeout = $timeout(function() {
            Movies.getMovies.query({},{filter: val}, function (response){ 
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
        }, 200); // delay 250 ms
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
    $scope.movie = response;                          
    $scope.similar_movies = response.similar_movies;

    $scope.setMovie = function(movie){
           $location.path('/movies/' + movie.id); 
      };    
  });            

}]);