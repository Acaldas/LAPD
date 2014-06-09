xquery version "3.0";

let $movies := doc("movies.xml")

return count($movies//movie)