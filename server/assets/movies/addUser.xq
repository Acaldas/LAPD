xquery version "3.0";
declare namespace request="http://exist-db.org/xquery/request";

let $users := doc('users.xml')
let $user := request:get-data()
let $username := $user//name/text()
let $password := $user//password/text()

return if(empty($username) or empty($password)) then
    '{error: "Invalid user"}'
else
    if(exists($users//name[text()=$user//name/text()])) then
        '{error: "User already exists"}'
    else
       update insert $user into $users/users