'use strict';
 
angular.module('mean.movies').factory('Movies', ['$resource', '$location',
  function($resource, $location) {
  	 return {
      getMovies: $resource('/getMovies/:id', {id: '@id' }, {
        query: { method: 'POST', params: {start: 'start', filter: '@filter', filterType: '@filterType'}, isArray: false }
      }),
      update: $resource('/updateMovies', {}, {
        query: { method: 'POST', params: {}, isArray: false }
      }),
      getSpecialList: $resource('/getSpecialList/:type', {type : '@type'}, {}) ,

      synchronizeTrakt: $resource('/synchronizeTrakt', {}, {
          query: { method: 'POST', params: {user: 'user', traktUser: 'traktUser', traktPassword: 'traktPassword'}, isArray: false }
      }),
      getRecomendation: $resource('/getRecomendation',{}, {
          query: { method: 'POST', params: {user: 'user'}, isArray: false }
      }),
      getUserRatings: $resource('/getUserRatings/:user', {user: '@user' }, {})
    };
}]).
	factory('Users', ['$resource', '$location',
  function($resource, $location) {
  	 return {
      addUser: $resource('/addUser', {}, {
        query: { method: 'POST', params: {name: '@name', password: '@password'}, isArray: false }
      }),
      addRating: $resource('/addRating', {}, {
        query: { method: 'POST', params: {user: '@user', movie: '@movie', actor: '@actor', director: '@director', grade: '@grade'}, isArray: false }
      }),
      login: $resource('/login', {}, {
        query: { method: 'POST', params: {user: '@user', password: '@password'}, isArray: false }
      })
    };
}]);