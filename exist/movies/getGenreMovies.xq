xquery version "3.0";

let $movies := doc("movies.xml")

let $genre-list := <genres>{
    for $genre in distinct-values($movies//genre)
    return <genre><name>{$genre}</name>
        {for $movie in $movies//movie[genres/genre = $genre]
        where $movie/poster/text() != "http://images.rottentomatoescdn.com/images/redesign/poster_default.gif"
        order by $movie//critics_score
            return <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie>
                }
    </genre>
}</genres>

return <genres>
    {
        for $genre in $genre-list//genre
        return <genre>
            {$genre/name}
        { for $movie in subsequence($genre-list//genre[name/text() = $genre/name/text() ]//movie,1,5)
            return $movie
        }
        </genre>
    }
    </genres>