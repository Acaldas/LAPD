'use strict';
 
angular.module('mean.movies').controller('MoviesMainController', ['$scope', '$stateParams', '$location', '$http', 'Global','Movies',
  function($scope, $stateParams, $location, $http, Global, Movies) {
    $scope.global = Global;
      
      // Get all movies
      $scope.movies = Movies.query();
 
      // Get movie with id 1
      $scope.test = Movies.get({},{'id': 1});      
      //http://www.masnun.com/2013/08/28/rest-access-in-angularjs-using-ngresource.html
  }
]);