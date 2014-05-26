xquery version "3.0";

 let $movies := doc('movies.xml')
  let $users := doc('users.xml')
  
  let $ordered_movies := <movies> {
    for $movie_rating in distinct-values($users//movie/id)
        let $entries := count($users//movie[id = $movie_rating])
         order by $entries descending
         return <movie>
             <id>{$movie_rating}</id>
             <ratings>{$entries}</ratings>
             </movie>
  }</movies>
             
  return <most_rated> {
      for $movie_rating in subsequence($ordered_movies//movie, 1, 5)
        let $movie := $movies//movie[id = $movie_rating/id]
        return <movie>
                    {$movie/id}
                    {$movie/title}
                    {$movie/poster}
                    {$movie_rating/ratings}
                </movie> 
    }</most_rated>