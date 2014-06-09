declare namespace exist = "http://exist.sourceforge.net/NS/exist";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";

declare option exist:serialize "method=xml media-type=text/xml indent=yes";

let $trakt-ratings := util:eval(request:get-parameter('query', ''))
let $date := request:get-parameter('date', '')
let $movies := doc('movies.xml')
let $users := doc('users.xml')
let $newUser := $users//user[name = request:get-parameter('user', '')]
let $traktUser := request:get-parameter('traktuser', '')
let $traktPassword := request:get-parameter('traktpassword', '')


return (
    for $user in $users//user[name = request:get-parameter('user','')]
    return (for $trakt-rating in $trakt-ratings//rating
    let $newRating := <rating>
                    <movie>
                    <id>{$movies//movie[imdb = $trakt-rating/imdb]/id/text()}</id>
                    </movie>
                    {$trakt-rating/date}
                    {$trakt-rating/grade}
                  </rating>
    where $movies//movie[imdb = $trakt-rating/imdb]/id/text()                 
       return (
           update delete $newUser//rating[movie=$movies//movie[imdb = $trakt-rating/imdb]/id/text()],
           update insert $newRating into $newUser/ratings 
       )
     ,update delete $newUser/traktUser
     ,update insert <traktUser>{$traktUser}</traktUser> into $newUser
     ,update delete $newUser/traktPassword
     ,update insert <traktPassword>{$traktPassword}</traktPassword> into $newUser
     ,update replace $users//user[name = $user/name] with $newUser)
     ,$trakt-ratings)