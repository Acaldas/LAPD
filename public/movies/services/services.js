'use strict';
 
angular.module('mean.movies').factory('Movies', ['$resource',
  function($resource) {
      return $resource(
        "/getMovie/:id",
        {id: "@id" }
//        ,{
//            "update": {method: "PUT"},
//            "reviews": {'method': 'GET', 'params': {'reviews_only': "true"}, isArray: true}
// 
//        }
    );
}]);