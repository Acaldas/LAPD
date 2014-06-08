declare namespace exist = "http://exist.sourceforge.net/NS/exist";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";

declare option exist:serialize "method=xml media-type=text/xml indent=yes";

let $movies := doc('movies.xml')
let $users := doc('users.xml')
let $user := $users//user[name = request:get-parameter('user', '')]

return <user>
        {$user/name}
        {$user/traktUser}
        {$user/traktPassword}
            {for $rating in $user//rating
             let $movie := $movies//movie[id = $rating/movie/id]
             where $rating[movie]
             return <rating>
                        {$rating/grade}
                        {$movie/imdb}
                        {$movie/title} 
                        {$movie/year}
                    </rating>
            }
        </user>