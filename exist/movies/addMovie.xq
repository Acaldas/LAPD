xquery version "3.0";
    declare namespace xdb="http://exist-db.org/xquery/xmldb";
    declare namespace t="http://exist-db.org/xquery/transform";
    declare namespace exist = "http://exist.sourceforge.net/NS/exist";
    declare namespace request="http://exist-db.org/xquery/request";
    declare namespace util="http://exist-db.org/xquery/util";

declare option exist:serialize "method=xml media-type=text/xml indent=yes";

    let $movies := doc("movies.xml")
    let $movie:= util:eval(request:get-parameter('query', ''))
    let $movie := t:transform($movie, doc("movie.xsl"), ())
    
    return if($movies//movie[id=$movie/id])
    then
        <status>Already exists</status>
    else
        (update insert $movie into $movies/movies,
                <status>{$movie/title} inserted</status>)