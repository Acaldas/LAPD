xquery version "3.0";
declare namespace request="http://exist-db.org/xquery/request";

    let $filter := request:get-parameter("filter", "")
    
    let $movies := doc('movies.xml')
    let $start := xs:integer(request:get-parameter("start", "1"))
    let $max := 29 
    
    return if($filter = "") then
        <movies> {
        for $movie in subsequence($movies//movie, $start, $max)
            return 
                <movie>
                    {$movie/id}
                    {$movie/title}
                    {$movie/poster}
                </movie> }
                </movies>
        else switch (xs:integer(request:get-parameter("filterType", "")))
        case 2 return 
                    <movies> {
                for $movie in subsequence($movies//movie[title/text()[contains(lower-case(.),lower-case($filter))]], $start, $start+$max)
                return 
                    <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie> 
            }
            </movies>
            
   case 3 return         <movies> {
                for $movie in subsequence($movies//movie[synopsis/text()[contains(lower-case(.),lower-case($filter))]], $start, $start+$max)
                return 
                    <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie> 
            }
            </movies>
case 4 return         <movies> {
                for $movie in subsequence($movies//movie[descendant::actor/name/text()[contains(lower-case(.),lower-case($filter))]], $start, $start+$max)
                return 
                    <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie> 
            }
            </movies>
    case 5 return <movies> {
                for $movie in subsequence($movies//movie[descendant::director/name/text()[contains(lower-case(.),lower-case($filter))]], $start, $start+$max)
                return 
                    <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie> 
            }
            </movies>
    default return 
        <movies> {
                for $movie in subsequence($movies//movie[descendant::*/text()[contains(lower-case(.),lower-case($filter))]], $start, $start+$max)
                return 
                    <movie>
                        {$movie/id}
                        {$movie/title}
                        {$movie/poster}
                    </movie> 
            }
            </movies>
           
        
        