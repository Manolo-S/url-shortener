"use strict";

var express = require('express');
var app = express();
var validUrl = require('valid-url');
var port = process.env.PORT || 3000;

var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://janklaassen:janklaassen1@ds051615.mongolab.com:51615/shorten-your-url');

var Schema = mongoose.Schema;

var shortUrlSchema = new Schema({
    urlNumber: {type: Number},
    originalUrl: {type: String}
});

var shortUrlModel= mongoose.model('urlshort', shortUrlSchema);



function checkURL(req, res){
	var res = res;
	var url = (req.originalUrl).slice(5);
	var response;
	console.log('url: ', url)
	if (validUrl.isUri(url)){
		shortUrlModel.find({originalUrl: url}, function(err,obj){
			if (obj[0]){
				response = JSON.stringify({"original_url": url, short_url: 'http://shorten-your-url.herokuapp.com/' + obj[0].urlNumber});   
				res.setHeader('Content-Type', 'text/html');
				res.send('<p>' + response + '</p>');
			} else {	
				console.log('url not found')	;
				shortUrlModel.count({}, function (err, count) {
					var newUrlCount = count + 1;
					response = JSON.stringify({"original_url": url, short_url: 'http://shorten-your-url.herokuapp.com/' + newUrlCount});   
					res.setHeader('Content-Type', 'text/html');
					res.send('<p>' + response + '</p>');
					storeShortUrl(url, newUrlCount);					
		        })
		      }		      
		})
	}
	 else {
		res.setHeader('Content-Type', 'text/html');
		res.send('<p>' + url + ' looks like an invalid URI</p>');	
	}
}



function storeShortUrl(url, newUrlCount){
	shortUrlModel.create({
	urlNumber: newUrlCount,
	originalUrl: url
}, function(err, urlObj){
	  if(!err){
	  	console.log(urlObj);
	  }
	});
}

function shortUrl(req, res){

	var id = req.params.id;
    
	shortUrlModel.find({urlNumber: id}, function(err, url){
		if (url[0]){
			console.log(url[0].originalUrl)
			res.redirect(url[0].originalUrl);
		}
		else {
			console.log("url not found")
		}
	});
}

app.get('/new/*', checkURL);

app.get('/:id', shortUrl);

app.listen(port);

console.log('Server listening on localhost  port: ' + port + '/');



