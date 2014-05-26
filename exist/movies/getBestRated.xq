xquery version "3.0";

 let $movies := doc('movies.xml')
  let $users := doc('users.xml')
  
  let $ordered_movies := <movies> {
    for $movie_rating in distinct-values($users//movie/id)
        let $rating := avg($users//rating[movie/id = $movie_rating]/grade)
         order by $rating descending
         return <movie>
             <id>{$movie_rating}</id>
             <rating>{$rating}</rating>
             </movie>
  }</movies>
             
  return <best_rated> {
      for $movie_rating in subsequence($ordered_movies//movie, 1, 5)
        let $movie := $movies//movie[id = $movie_rating/id]
        return <movie>
                    {$movie/id}
                    {$movie/title}
                    {$movie/poster}
                    {$movie_rating/rating}
                </movie> 
    }</best_rated>