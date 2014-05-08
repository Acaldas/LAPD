xquery version "3.0";
declare namespace request="http://exist-db.org/xquery/request";

    let $filter := request:get-parameter("filter", "")
    let $movies := doc('movies.xml')
    return if($filter = "") then
    <movies> {
    for $movie in $movies//movie
        return 
            <movie>
                {$movie/id}
                {$movie/title}
                {$movie/poster}
            </movie> }
            </movies>
    else
        <movies> {
            for $movie in $movies//movie[descendant::*/text()[contains(lower-case(.),lower-case($filter))]]
            return 
                <movie>
                    {$movie/id}
                    {$movie/title}
                    {$movie/poster}
                </movie> 
        }
        </movies>