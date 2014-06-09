declare namespace exist = "http://exist.sourceforge.net/NS/exist";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";

declare option exist:serialize "method=xml media-type=text/xml indent=yes";

let $recomendations := util:eval(request:get-parameter('query', ''))
let $movies := doc('movies.xml')

return
  <movies>
      {for $recomendation in $recomendations//movie
        let $movie := $movies//movie[imdb = $recomendation/imdb]
        where $movies//movie[imdb = $recomendation/imdb]
         return <movie>
                    {$movie/id}
                    {$movie/title}
                    {$movie/poster}
                </movie> 
          
      }
      </movies>
