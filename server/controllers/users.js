'use strict';

var existUsername = 'admin';
var existPassword = 'qweasd';
var request = require('request'); //https://github.com/mikeal/request
var libxml = require("libxmljs");
var xml2jsparser = require('xml2js'); 
var fs = require('fs');

exports.addUser = function(req, res) {

	var name = req.body.name;
	var password = req.body.password;
	if(name != null && password != null) {

		var user = new libxml.Document();
		  user.node('user')
		    .node('name', name)		     
		    .parent()
		    .node('password', password)
		    .parent()
		    .node('ratings');

		var query = {
			url: 'http://localhost:8080/exist/rest/db/apps/movies/addUser.xq',
			body: user.toString()
		}

		request.post(query, function (error, response, body) {	
			xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						    console.log(err);
						  } else {
						    res.send(result);
						  }	
			});				
		}).auth(existUsername, existPassword, true);

	} else
		res.send({status: "Invalid User"});

	
}

exports.login = function(req, res) {
	var name = req.body.name;
	var password = req.body.password;
	if(name != null && password != null) {

		var url= 'http://localhost:8080/exist/rest/db/apps/movies/login.xq';

		request.post(url, {form: {user: name, password: password}},function (error, response, body) {

			xml2jsparser.parseString(body, {explicitArray: false}, function (err, result) {
						 if (err) { 
						    console.log(err);
						  } else {
						    res.send(result);
						  }	
			});		
		}).auth(existUsername, existPassword, true);

	} else
		res.send({status: "Invalid User"});
}

exports.addRating = function (req, res) {
	var elementName = "";
	var elementValue;

	if(req.body.movie){
		elementValue = req.body.movie;
		elementName = "movie";
	} else if(req.body.actor){
		elementValue = req.body.actor;
		elementName = "actor";
	} else if(req.body.director){
		elementValue = req.body.director;
		elementName = "director";
	}

	var user = req.body.user;
	var grade = req.body.grade;

	if(user != null && grade != null && grade >= 0 && grade <= 5 && elementValue != null) {
		
		var date = new Date();
		var dateString = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

		var xpathA = "//user[name=\"" + user + "\"]//rating[" + elementName + "[id=\"" + elementValue + "\"]]";
		var xpathB = "//user[name=\"" + user + "\"]/ratings";
		
		var rating = new libxml.Document();
			  rating.node('xu:modifications')
			  .attr("version","1.0")
			  .attr("xmlns:xu", "http://www.xmldb.org/xupdate")
			  .node("xu:remove")
			  .attr("select",xpathA)
			  .parent()
			  .node("xu:append")
			  .attr("select", xpathB)
			  .node('xu:element')
			    .attr("name","rating")
			    .node(elementName)
			    .node('id', elementValue.toString())		     
			    .parent()
			    .parent()
			    .node('date', dateString)
			    .parent()
			    .node('grade', grade.toString());

		var query = {
			url: 'http://localhost:8080/exist/rest/db/apps/movies/users.xml',
			body: rating.toString()
		}

		request.post(query, function (error, response, body) {
			console.log(body);
			res.send(body);
		}).auth(existUsername, existPassword, true);


	} else
		res.send("Invalid");
};