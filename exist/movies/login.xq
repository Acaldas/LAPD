xquery version "3.0";

declare namespace request="http://exist-db.org/xquery/request";

let $users := doc('users.xml')
let $username := request:get-parameter('user','')
let $password := request:get-parameter('password','')

return if(empty($username) or empty($password)) then
   <status>Invalid user</status>
else
    if($users//user[name/text()=$username]/password = $password) then
        <status>Success</status>
    else
       <status>Invalid user</status>