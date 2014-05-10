'use strict';
 
angular.module('mean.movies').factory('Movies', ['$resource', '$location',
  function($resource, $location) {
  	 return {
      getMovies: $resource('/getMovies/:id', {id: '@id' }, {
        query: { method: 'POST', params: {filter: '@filter'}, isArray: false }
      }),
      update: $resource('/updateMovies', {}, {
        query: { method: 'POST', params: {}, isArray: false }
      })
    };
}]).
	factory('Users', ['$resource', '$location',
  function($resource, $location) {
  	 return {
      addUser: $resource('/addUser', {}, {
        query: { method: 'POST', params: {name: '@name', password: '@password'}, isArray: false }
      })
    };
}]);