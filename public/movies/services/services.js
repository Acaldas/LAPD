'use strict';
 
angular.module('mean.movies').factory('Movies', ['$resource',
  function($resource) {
  	 return {
      getMovies: $resource('/getMovie/:id', {id: '@id' }, {
        query: { method: 'GET', params: {}, isArray: false }
      }),
      update: $resource('/updateMovies', {}, {
        query: { method: 'POST', params: {}, isArray: false }
      })
    };
}]);