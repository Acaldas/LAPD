'use strict';
 
//Setting up route
angular.module('mean.movies').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('main movies', {
        url: '/movies',
        templateUrl: 'public/movies/views/main.html'
      })
      .state('show movie', {
      	url: '/movies/:id',
        templateUrl: 'public/movies/views/movie.html'
      });
  }
]);