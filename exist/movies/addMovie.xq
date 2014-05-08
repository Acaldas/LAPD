xquery version "3.0";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
let $movie := util:eval(request:get-parameter("movie",""))
let $movies := doc('movies.xml')

let $append-result := update insert $movie into $movies/movies

return $movie