'use strict';
 
//Setting up route
angular.module('mean.movies').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('main movies', {
        url: '/movies',
        templateUrl: 'public/movies/views/main.html'
      });
  }
]);